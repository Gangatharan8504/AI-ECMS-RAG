import os
import faiss
import numpy as np

from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
from groq import Groq


# ============================================================
# 1. LOAD EMBEDDING MODEL
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
# 2. EXTRACT PDF PAGE BY PAGE
# ============================================================

def extract_pdf_pages(pdf_file):
    """
    Extract complete text page-by-page.

    Returns:
        [
            {
                "page_number": 1,
                "text": "..."
            },
            ...
        ]
    """

    reader = PdfReader(pdf_file)

    pages = []

    for page_number, page in enumerate(reader.pages, start=1):

        text = page.extract_text() or ""

        pages.append({
            "page_number": page_number,
            "text": text.strip()
        })

    return pages


# ============================================================
# 3. CHUNK DOCUMENT
# ============================================================

def create_chunks(pages, chunk_size=500, overlap=50):

    chunks = []

    for page in pages:

        text = page["text"]

        if not text:
            continue

        words = text.split()

        start = 0

        while start < len(words):

            end = start + chunk_size

            chunk_words = words[start:end]

            if not chunk_words:
                break

            chunk_text = " ".join(chunk_words)

            chunks.append({
                "page_number": page["page_number"],
                "chunk_index": len(chunks),
                "text": chunk_text
            })

            start += chunk_size - overlap

    return chunks


# ============================================================
# 4. CREATE EMBEDDINGS
# ============================================================

def create_embeddings(chunks):

    model = get_embedding_model()

    texts = [
        chunk["text"]
        for chunk in chunks
    ]

    embeddings = model.encode(
        texts,
        convert_to_numpy=True
    )

    embeddings = embeddings.astype("float32")

    # Normalize for cosine similarity
    faiss.normalize_L2(embeddings)

    return embeddings


# ============================================================
# 5. BUILD FAISS INDEX
# ============================================================

def build_faiss_index(embeddings):

    dimension = embeddings.shape[1]

    index = faiss.IndexFlatIP(dimension)

    index.add(embeddings)

    return index


# ============================================================
# 6. SEARCH DOCUMENT
# ============================================================

def search_document(
    question,
    index,
    chunks,
    top_k=5
):

    model = get_embedding_model()

    question_embedding = model.encode(
        [question],
        convert_to_numpy=True
    )

    question_embedding = question_embedding.astype(
        "float32"
    )

    faiss.normalize_L2(question_embedding)

    scores, indices = index.search(
        question_embedding,
        min(top_k, len(chunks))
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
# 7. GROQ ANSWER GENERATION
# ============================================================

def generate_answer(
    question,
    retrieved_chunks
):

    api_key = os.getenv("GROQ_API_KEY")

    model_name = os.getenv(
        "GROQ_MODEL",
        "llama-3.3-70b-versatile"
    )

    if not api_key:

        raise ValueError(
            "GROQ_API_KEY is not configured."
        )

    client = Groq(
        api_key=api_key
    )

    # ---------------------------------------------
    # Build document context
    # ---------------------------------------------

    context_parts = []

    for chunk in retrieved_chunks:

        context_parts.append(
            f"""
[Page {chunk['page_number']}]

{chunk['text']}
"""
        )

    context = "\n".join(context_parts)

    # ---------------------------------------------
    # Strict grounding prompt
    # ---------------------------------------------

    system_prompt = """
You are a document-grounded AI assistant.

Your job is to answer questions using ONLY the
provided document context.

Rules:

1. Do not use outside knowledge.
2. Do not invent facts.
3. Do not assume information that is not present.
4. If the answer cannot be found in the provided
   context, say exactly:

"The requested information is not available
in the uploaded document."

5. Give a concise and clear answer.
6. Mention relevant page numbers when possible.
"""

    user_prompt = f"""
DOCUMENT CONTEXT:

{context}

USER QUESTION:

{question}
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