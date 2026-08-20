import os
import re

import faiss
import numpy as np
import fitz
import pytesseract

from PIL import Image
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
from groq import Groq


# ============================================================
# EMBEDDING MODEL
# ============================================================

_embedding_model = None


def get_embedding_model():
    global _embedding_model

    if _embedding_model is None:
        _embedding_model = SentenceTransformer(
            "all-MiniLM-L6-v2"
        )

    return _embedding_model


# ============================================================
# 1. EXTRACT PDF TEXT + OCR
# ============================================================

def extract_pdf_pages(pdf_file):
    """
    Extract PDF text page-by-page.

    Process:
    1. Try normal PDF text extraction.
    2. Check whether extracted text is useful.
    3. Use OCR for pages with insufficient text.
    4. Preserve page number and extraction method.
    """

    reader = PdfReader(pdf_file)

    pages = []

    # --------------------------------------------------------
    # READ PDF BYTES
    # --------------------------------------------------------

    pdf_file.seek(0)
    pdf_bytes = pdf_file.read()

    # --------------------------------------------------------
    # NORMAL TEXT EXTRACTION
    # --------------------------------------------------------

    for page_number, page in enumerate(
        reader.pages,
        start=1
    ):

        try:
            text = page.extract_text() or ""
        except Exception:
            text = ""

        text = text.strip()

        pages.append({
            "page_number": page_number,
            "text": text,
            "method": "text"
        })

    # --------------------------------------------------------
    # CHECK WHETHER OCR IS REQUIRED
    # --------------------------------------------------------

    def needs_ocr(text):

        if not text:
            return True

        cleaned = re.sub(
            r"\s+",
            " ",
            text
        ).strip()

        # Very little extracted text
        if len(cleaned) < 30:
            return True

        # Count alphabetic characters
        alphabetic_chars = sum(
            1
            for char in cleaned
            if char.isalpha()
        )

        # Probably an image/scanned page
        if alphabetic_chars < 15:
            return True

        return False

    ocr_page_indexes = [
        index
        for index, page in enumerate(pages)
        if needs_ocr(page["text"])
    ]

    # --------------------------------------------------------
    # OCR FALLBACK
    # --------------------------------------------------------

    if ocr_page_indexes:

        pdf_document = fitz.open(
            stream=pdf_bytes,
            filetype="pdf"
        )

        for index in ocr_page_indexes:

            try:

                pdf_page = pdf_document[index]

                # Render PDF page as image
                pixmap = pdf_page.get_pixmap(
                    matrix=fitz.Matrix(2.5, 2.5),
                    alpha=False
                )

                image = Image.frombytes(
                    "RGB",
                    (
                        pixmap.width,
                        pixmap.height
                    ),
                    pixmap.samples
                )

                # ------------------------------------------------
                # OCR
                # ------------------------------------------------

                ocr_text = pytesseract.image_to_string(
                    image,
                    config="--psm 6"
                )

                ocr_text = ocr_text.strip()

                # ------------------------------------------------
                # SAVE OCR RESULT
                # ------------------------------------------------

                if ocr_text:

                    pages[index]["text"] = ocr_text
                    pages[index]["method"] = "OCR"

                else:

                    pages[index]["method"] = "OCR_FAILED"

            except Exception as ocr_error:

                print(
                    f"OCR failed for page "
                    f"{index + 1}: {ocr_error}"
                )

                pages[index]["method"] = "OCR_FAILED"

        pdf_document.close()

    return pages


# ============================================================
# 2. CREATE DOCUMENT CHUNKS
# ============================================================

def create_chunks(
    pages,
    chunk_size=500,
    overlap=50
):

    chunks = []

    if overlap >= chunk_size:
        raise ValueError(
            "Overlap must be smaller than chunk size."
        )

    for page in pages:

        text = page.get("text", "").strip()

        if not text:
            continue

        words = text.split()

        start = 0

        while start < len(words):

            end = start + chunk_size

            chunk_words = words[start:end]

            if not chunk_words:
                break

            chunk_text = " ".join(
                chunk_words
            )

            chunks.append({
                "page_number": page["page_number"],
                "chunk_index": len(chunks),
                "text": chunk_text
            })

            start += chunk_size - overlap

    return chunks


# ============================================================
# 3. CREATE EMBEDDINGS
# ============================================================

def create_embeddings(chunks):

    if not chunks:
        raise ValueError(
            "No document chunks available."
        )

    model = get_embedding_model()

    texts = [
        chunk["text"]
        for chunk in chunks
    ]

    embeddings = model.encode(
        texts,
        convert_to_numpy=True
    )

    embeddings = embeddings.astype(
        "float32"
    )

    # Normalize for cosine similarity
    faiss.normalize_L2(
        embeddings
    )

    return embeddings


# ============================================================
# 4. BUILD FAISS INDEX
# ============================================================

def build_faiss_index(embeddings):

    if embeddings is None:
        raise ValueError(
            "Embeddings are empty."
        )

    if len(embeddings) == 0:
        raise ValueError(
            "No embeddings were generated."
        )

    dimension = embeddings.shape[1]

    index = faiss.IndexFlatIP(
        dimension
    )

    index.add(
        embeddings
    )

    return index


# ============================================================
# 5. SEARCH DOCUMENT
# ============================================================

def search_document(
    question,
    index,
    chunks,
    top_k=5
):

    if index is None:
        raise ValueError(
            "FAISS index is not available."
        )

    if not chunks:
        return []

    model = get_embedding_model()

    question_embedding = model.encode(
        [question],
        convert_to_numpy=True
    )

    question_embedding = (
        question_embedding.astype(
            "float32"
        )
    )

    # Normalize query vector
    faiss.normalize_L2(
        question_embedding
    )

    number_of_results = min(
        top_k,
        len(chunks)
    )

    scores, indices = index.search(
        question_embedding,
        number_of_results
    )

    results = []

    for score, index_position in zip(
        scores[0],
        indices[0]
    ):

        if index_position < 0:
            continue

        chunk = chunks[index_position]

        results.append({
            "page_number": chunk["page_number"],
            "chunk_index": chunk["chunk_index"],
            "text": chunk["text"],
            "score": float(score)
        })

    return results


# ============================================================
# 6. GROQ CLIENT
# ============================================================

def get_groq_client():

    api_key = os.getenv(
        "GROQ_API_KEY"
    )

    if not api_key:

        raise ValueError(
            "GROQ_API_KEY is not configured. "
            "Please add it to your .env file."
        )

    return Groq(
        api_key=api_key
    )


def get_groq_model():
    model = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    if model in ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama3-8b-8192", "llama3-70b-8192", "gemma2-9b-it"]:
        return "openai/gpt-oss-120b"
    return model


# ============================================================
# 7. RAG QUESTION ANSWERING
# ============================================================

def generate_answer(
    question,
    retrieved_chunks
):

    if not retrieved_chunks:

        return (
            "I could not find information about this "
            "in the uploaded document."
        )

    client = get_groq_client()

    model_name = get_groq_model()

    # --------------------------------------------------------
    # BUILD DOCUMENT CONTEXT
    # --------------------------------------------------------

    context_parts = []

    for chunk in retrieved_chunks:

        context_parts.append(
            f"""
[Page {chunk['page_number']}]

{chunk['text']}
"""
        )

    context = "\n".join(
        context_parts
    )

    # --------------------------------------------------------
    # SYSTEM PROMPT
    # --------------------------------------------------------

    system_prompt = """
You are an intelligent AI document assistant.

Your job is to answer the user's question
using the uploaded document as the primary source.

Answer naturally and conversationally,
similar to a helpful ChatGPT assistant.

IMPORTANT RULES:

1. Use ONLY information supported by the
   provided document context.

2. Do NOT invent facts that are not present
   in the document.

3. Do NOT use outside knowledge.

4. If the document contains enough information,
   give a clear and useful explanation.

5. If the user asks a simple question,
   give a simple direct answer.

6. If the user asks for an explanation,
   explain the concept clearly.

7. If the user asks for steps,
   provide numbered steps.

8. If the user asks for a comparison,
   use a simple table when appropriate.

9. If examples are available in the document,
   provide them.

10. Mention the relevant page number when
    possible.

11. If the requested information is NOT present
    in the document, respond:

"I could not find information about this
in the uploaded document."

Keep responses clear, natural and useful.
"""

    # --------------------------------------------------------
    # USER PROMPT
    # --------------------------------------------------------

    user_prompt = f"""
Here is the relevant information retrieved
from the uploaded document:

DOCUMENT:

{context}

USER QUESTION:

{question}

Answer the user's question naturally using
only the document information above.
"""

    # --------------------------------------------------------
    # GROQ REQUEST
    # --------------------------------------------------------

    response = client.chat.completions.create(
        model=model_name,
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ],
        temperature=0.2
    )

    return response.choices[0].message.content


# ============================================================
# 8. BASIC DOCUMENT ANALYSIS
# ============================================================

def analyze_document(pages):

    full_text = "\n".join(
        page.get("text", "")
        for page in pages
        if page.get("text", "").strip()
    )

    words = full_text.split()

    return {
        "word_count": len(words),
        "character_count": len(full_text),
        "page_count": len(pages)
    }


# ============================================================
# 9. AI EXECUTIVE SUMMARY
# ============================================================

def generate_document_summary(pages):

    client = get_groq_client()

    model_name = get_groq_model()

    full_text = "\n\n".join(
        f"[Page {page['page_number']}]\n"
        f"{page['text']}"
        for page in pages
        if page.get("text", "").strip()
    )

    system_prompt = """
You are an intelligent document analysis assistant.

Analyze the COMPLETE document.

Generate exactly 5 important points.

Rules:

1. Analyze the entire supplied document.
2. Do not summarize only the first page.
3. Identify the most important information.
4. Keep each point concise.
5. Do not invent information.
6. Use only information found in the document.
7. Prefer important concepts, findings,
   conclusions, dates, and key information.

Return exactly 5 numbered points.
"""

    user_prompt = f"""
COMPLETE DOCUMENT:

{full_text}

Generate exactly 5 important points.
"""

    response = client.chat.completions.create(
        model=model_name,
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ],
        temperature=0.1
    )

    return response.choices[0].message.content


# ============================================================
# 10. KEY TOPICS
# ============================================================

def generate_key_topics(pages):

    client = get_groq_client()

    model_name = get_groq_model()

    full_text = "\n".join(
        page.get("text", "")
        for page in pages
        if page.get("text", "").strip()
    )

    system_prompt = """
Analyze the uploaded document.

Identify the 5 most important topics.

Use ONLY information present in the document.

Do not invent topics.

Return exactly 5 numbered topics.
"""

    response = client.chat.completions.create(
        model=model_name,
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": full_text
            }
        ],
        temperature=0.1
    )

    return response.choices[0].message.content


# ============================================================
# 11. DOCUMENT RISK ANALYSIS
# ============================================================

def analyze_document_risks(pages):

    client = get_groq_client()

    model_name = get_groq_model()

    full_text = "\n".join(
        page.get("text", "")
        for page in pages
        if page.get("text", "").strip()
    )

    system_prompt = """
Analyze the document for content-quality risks.

Look for:

- Missing important information
- Incomplete sections
- Unclear statements
- Obvious content problems
- Contradictory information
- Missing dates where relevant
- Missing names/details where relevant

IMPORTANT:

Do NOT invent risks.

Only report a risk when there is
evidence in the document.

If no obvious content-quality risk exists,
return exactly:

"No significant content-quality risks detected."

Keep the response short.
"""

    response = client.chat.completions.create(
        model=model_name,
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": full_text
            }
        ],
        temperature=0.1
    )

    return response.choices[0].message.content


# ============================================================
# 12. TRANSLATE CONTENT USING GROQ
# ============================================================

def translate_text(
    text,
    target_language
):

    if not text or not text.strip():

        return (
            "There is no content to translate."
        )

    client = get_groq_client()

    model_name = get_groq_model()

    system_prompt = f"""
You are a professional document translation assistant.

Translate the provided content into
{target_language}.

Rules:

1. Preserve the original meaning.
2. Do not add information.
3. Do not remove important information.
4. Preserve technical terms when appropriate.
5. Preserve names.
6. Preserve numbers.
7. Preserve dates.
8. Preserve formulas.
9. Maintain the structure of the original content.
10. Return only the translated content.
"""

    response = client.chat.completions.create(
        model=model_name,
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": text
            }
        ],
        temperature=0.1
    )

    return response.choices[0].message.content


# ============================================================
# 13. LANGUAGE DETECTION
# ============================================================

def detect_language(text):

    if not text or not text.strip():
        return "Unknown"

    client = get_groq_client()

    prompt = f"""
Detect the primary language of the following document.

Return ONLY the language name.

Use one of these common language names when applicable:

English
Tamil
Hindi
Telugu
Malayalam
Kannada
Bengali
Marathi
Gujarati
Punjabi
Urdu
French
German
Spanish
Italian
Portuguese
Arabic
Chinese
Japanese
Korean
Russian

Do not explain anything.

TEXT:

{text[:12000]}
"""

    response = client.chat.completions.create(
        model=get_groq_model(),
        messages=[
            {
                "role": "system",
                "content": "You are a precise language detection assistant."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0
    )

    language = (
        response
        .choices[0]
        .message
        .content
        .strip()
    )

    return language