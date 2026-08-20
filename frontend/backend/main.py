import os
import io
import uuid
import traceback
from typing import Optional, List

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from rag_engine import (
    extract_pdf_pages,
    create_chunks,
    create_embeddings,
    build_faiss_index,
    search_document,
    generate_answer,
    analyze_document,
    generate_document_summary,
    generate_key_topics,
    analyze_document_risks,
    translate_text,
    detect_language,
)


# ============================================================
# PYDANTIC REQUEST MODELS
# ============================================================

class AskRequest(BaseModel):
    question: str


class TranslateRequest(BaseModel):
    text: str
    target_language: str


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="AI ECMS API",
    description="AI-Based College Enterprise Content Management System",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# IN-MEMORY DOCUMENT STORE
# ============================================================

documents = {}


# ============================================================
# ROOT & HEALTH CHECK
# ============================================================

dist_dirs = [
    os.path.join(os.path.dirname(__file__), "frontend", "frontend", "dist"),
    os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"),
    os.path.join(os.path.dirname(__file__), "dist"),
]

frontend_dist = next((d for d in dist_dirs if os.path.exists(d)), None)

if frontend_dist:
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")


@app.get("/")
def root():
    if frontend_dist:
        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
    return {
        "status": "online",
        "service": "AI ECMS Backend",
        "message": "AI ECMS FastAPI backend is running",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AI ECMS",
        "rag_engine": "available",
        "documents_count": len(documents),
    }


# ============================================================
# LIST DOCUMENTS
# ============================================================

@app.get("/api/documents")
def list_documents():
    doc_list = []
    for doc_id, doc in documents.items():
        doc_list.append({
            "id": doc["id"],
            "name": doc["name"],
            "category": "Academic Document",
            "pages": doc["analysis"]["page_count"],
            "word_count": doc["analysis"]["word_count"],
            "character_count": doc["analysis"]["character_count"],
            "language": doc["language"],
            "status": "Processed",
            "summary": doc.get("summary", ""),
            "key_topics": doc.get("key_topics", ""),
            "risks": doc.get("risks", ""),
        })
    return {
        "success": True,
        "documents": doc_list,
        "count": len(doc_list),
    }


# ============================================================
# UPLOAD + PROCESS DOCUMENT
# ============================================================

@app.post("/api/documents/upload")
async def upload_document(
    file: UploadFile = File(...)
):
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(
                status_code=400,
                detail="No file selected."
            )

        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are supported."
            )

        # Read PDF bytes
        pdf_bytes = await file.read()

        if not pdf_bytes:
            raise HTTPException(
                status_code=400,
                detail="The uploaded PDF is empty."
            )

        # Extract PDF text + OCR
        pdf_stream = io.BytesIO(pdf_bytes)
        pages = extract_pdf_pages(pdf_stream)

        if not pages:
            raise HTTPException(
                status_code=400,
                detail="No pages were found in the PDF."
            )

        # Check readable content
        full_text = "\n".join(
            page["text"]
            for page in pages
            if page.get("text", "").strip()
        ).strip()

        if not full_text:
            raise HTTPException(
                status_code=422,
                detail=(
                    "No readable text was found. "
                    "If this is a scanned PDF, make sure "
                    "Tesseract OCR is installed and available in system PATH."
                )
            )

        # Detect language
        try:
            detected_language = detect_language(full_text)
        except Exception as e:
            print(f"Language detection fallback: {e}")
            detected_language = "English"

        # Create chunks
        chunks = create_chunks(pages)

        if not chunks:
            raise HTTPException(
                status_code=422,
                detail="No document chunks could be created."
            )

        # Create embeddings
        embeddings = create_embeddings(chunks)

        # Build FAISS index
        faiss_index = build_faiss_index(embeddings)

        # Basic document analysis
        analysis = analyze_document(pages)

        # AI summary
        try:
            summary = generate_document_summary(pages)
        except Exception as e:
            print(f"Summary generation error: {e}")
            summary = "Summary generation unavailable (check Groq API key)."

        # Key topics
        try:
            key_topics = generate_key_topics(pages)
        except Exception as e:
            print(f"Key topics generation error: {e}")
            key_topics = "Key topics generation unavailable."

        # Risk analysis
        try:
            risks = analyze_document_risks(pages)
        except Exception as e:
            print(f"Risk analysis error: {e}")
            risks = "Risk analysis unavailable."

        # Generate unique document ID
        document_id = str(uuid.uuid4())

        # Store document in memory
        documents[document_id] = {
            "id": document_id,
            "name": file.filename,
            "pages": pages,
            "chunks": chunks,
            "embeddings": embeddings,
            "faiss_index": faiss_index,
            "language": detected_language,
            "analysis": analysis,
            "summary": summary,
            "key_topics": key_topics,
            "risks": risks,
        }

        return {
            "success": True,
            "message": "Document processed successfully.",
            "document": {
                "id": document_id,
                "name": file.filename,
                "category": "Academic Document",
                "page_count": analysis["page_count"],
                "word_count": analysis["word_count"],
                "character_count": analysis["character_count"],
                "language": detected_language,
                "status": "Processed",
            },
            "pages": pages,
            "summary": summary,
            "key_topics": key_topics,
            "risks": risks,
        }

    except HTTPException:
        raise
    except Exception as error:
        print("\n========== AI ECMS BACKEND ERROR ==========")
        traceback.print_exc()
        print("===========================================\n")
        raise HTTPException(
            status_code=500,
            detail=f"Document processing failed: {str(error)}"
        )


# ============================================================
# GET SINGLE DOCUMENT
# ============================================================

@app.get("/api/documents/{document_id}")
def get_document(document_id: str):
    document = documents.get(document_id)

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )

    return {
        "success": True,
        "document": {
            "id": document["id"],
            "name": document["name"],
            "category": "Academic Document",
            "pages": document["analysis"]["page_count"],
            "word_count": document["analysis"]["word_count"],
            "character_count": document["analysis"]["character_count"],
            "language": document["language"],
            "status": "Processed",
            "analysis": document["analysis"],
            "summary": document["summary"],
            "key_topics": document["key_topics"],
            "risks": document["risks"],
        },
        "pages": document["pages"],
    }


# ============================================================
# ASK QUESTION (GROUNDED RAG QA)
# ============================================================

@app.post("/api/documents/{document_id}/ask")
async def ask_document(
    document_id: str,
    payload: AskRequest,
):
    try:
        document = documents.get(document_id)

        if not document:
            raise HTTPException(
                status_code=404,
                detail="Document not found. Please upload or select a valid document."
            )

        question = payload.question.strip()
        if not question:
            raise HTTPException(
                status_code=400,
                detail="Question cannot be empty."
            )

        # Retrieve relevant chunks from FAISS
        retrieved_chunks = search_document(
            question,
            document["faiss_index"],
            document["chunks"],
            top_k=5,
        )

        # Generate grounded answer via Groq
        answer = generate_answer(
            question,
            retrieved_chunks
        )

        return {
            "success": True,
            "question": question,
            "answer": answer,
            "sources": [
                {
                    "title": document["name"],
                    "page": f"Page {chunk['page_number']}",
                    "page_number": chunk["page_number"],
                    "chunk_index": chunk["chunk_index"],
                    "text": chunk["text"],
                    "score": round(chunk["score"], 4),
                }
                for chunk in retrieved_chunks
            ],
        }

    except HTTPException:
        raise
    except Exception as error:
        print("\n========== ASK ERROR ==========")
        traceback.print_exc()
        print("===============================\n")
        raise HTTPException(
            status_code=500,
            detail=f"Question answering failed: {str(error)}"
        )


# ============================================================
# TRANSLATE
# ============================================================

@app.post("/api/translate")
async def translate_document(payload: TranslateRequest):
    try:
        text = payload.text.strip()
        target_language = payload.target_language.strip()

        if not text:
            raise HTTPException(
                status_code=400,
                detail="Text cannot be empty."
            )

        if not target_language:
            raise HTTPException(
                status_code=400,
                detail="Target language is required."
            )

        translated_text = translate_text(
            text,
            target_language
        )

        return {
            "success": True,
            "target_language": target_language,
            "translation": translated_text,
        }

    except HTTPException:
        raise
    except Exception as error:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Translation failed: {str(error)}"
        )


# ============================================================
# SPA ROUTING FALLBACK
# ============================================================

if frontend_dist:
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        raise HTTPException(status_code=404, detail="Page not found")