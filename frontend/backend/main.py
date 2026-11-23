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
from auth import register_user, login_user


# ============================================================
# PYDANTIC REQUEST MODELS
# ============================================================

class AskRequest(BaseModel):
    question: str


class TranslateRequest(BaseModel):
    text: str
    target_language: str


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "Student"


class LoginRequest(BaseModel):
    email: str
    password: str


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
# AUTHENTICATION ENDPOINTS
# ============================================================

@app.post("/api/auth/register")
def register(payload: RegisterRequest):
    success, message, user = register_user(
        payload.name,
        payload.email,
        payload.password,
        payload.role or "Student"
    )
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {
        "success": True,
        "message": message,
        "user": user
    }


@app.post("/api/auth/login")
def login(payload: LoginRequest):
    success, message, user = login_user(
        payload.email,
        payload.password
    )
    if not success:
        raise HTTPException(status_code=401, detail=message)
    return {
        "success": True,
        "message": message,
        "user": user
    }


@app.get("/api/auth/me")
def get_auth_status():
    return {
        "status": "online",
        "service": "AI ECMS Authentication"
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
# MULTI-AGENT CONTENT AUTOMATION PIPELINE (AGENTS ENGINE)
# ============================================================

from workflow_db import get_workflow_db
from agents_engine import (
    run_draft_agent,
    run_review_agent,
    run_localization_agent,
    run_compliance_agent,
    run_publishing_agent,
    run_content_intelligence_agent
)

class ProductInputRequest(BaseModel):
    name: str
    description: Optional[str] = ""
    specs: Optional[str] = ""
    features: Optional[str] = ""
    target_audience: Optional[str] = ""
    category: Optional[str] = ""
    customer_feedback: Optional[str] = ""
    content_objective: Optional[str] = "Product Launch"
    preferred_language: Optional[str] = "English"
    doc_extracted_text: Optional[str] = ""

class ApprovalRequest(BaseModel):
    workflow_id: str
    status: str # APPROVED, REJECTED, MODIFICATION_REQUESTED
    approved_by: str
    comments: Optional[str] = ""

class PublishRequest(BaseModel):
    workflow_id: str
    channels: List[str]
    scheduled_at: Optional[str] = None

class ComplianceRulesRequest(BaseModel):
    brand_guidelines: str
    company_terminology: str
    restricted_words: str
    required_disclaimers: str
    regulatory_rules: str

class PlatformConnectRequest(BaseModel):
    platform_id: str
    account_name: str
    credentials: Optional[str] = ""


@app.post("/api/agents/products")
def create_product_and_run_pipeline(payload: ProductInputRequest):
    try:
        product_id = str(uuid.uuid4())
        workflow_id = str(uuid.uuid4())
        conn = get_workflow_db()
        c = conn.cursor()

        # 1. Store Product Record
        c.execute("""
        INSERT INTO products (
            id, name, description, specs, features, target_audience, category,
            customer_feedback, content_objective, preferred_language, doc_extracted_text
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            product_id, payload.name, payload.description, payload.specs, payload.features,
            payload.target_audience, payload.category, payload.customer_feedback,
            payload.content_objective, payload.preferred_language, payload.doc_extracted_text
        ))

        # 2. Run DRAFT AGENT
        product_dict = payload.dict()
        draft_result, draft_ms = run_draft_agent(product_dict)

        # 3. Run REVIEW AGENT
        review_result, review_ms = run_review_agent(product_dict, draft_result)

        # 4. Run LOCALIZATION AGENT
        target_lang = "Tamil" if payload.preferred_language != "Tamil" else "Hindi"
        content_to_loc = {
            "title": draft_result.get("draft_title", ""),
            "content": review_result.get("revised_content") or draft_result.get("draft_main_content", ""),
            "caption": draft_result.get("draft_social_caption", "")
        }
        loc_result, loc_ms = run_localization_agent(content_to_loc, target_language=target_lang)

        # 5. Run COMPLIANCE AGENT
        comp_result, comp_ms = run_compliance_agent(content_to_loc)

        # 6. Save Complete Workflow State
        c.execute("""
        INSERT INTO workflows (
            id, product_id, status, current_stage,
            draft_title, draft_main_content, draft_short_description, draft_social_caption, draft_hashtags,
            review_grammar_issues, review_quality_feedback, review_unsupported_statements, review_suggestions, review_revised_content,
            localization_target_language, localization_translated_title, localization_translated_content, localization_translated_caption,
            compliance_status, compliance_brand_tone_check, compliance_prohibited_words, compliance_unsupported_claims, compliance_regulatory_concerns, compliance_details,
            approval_status
        ) VALUES (
            ?, ?, 'PENDING_APPROVAL', 'HUMAN_APPROVAL',
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            'PENDING'
        )
        """, (
            workflow_id, product_id,
            draft_result.get("draft_title"), draft_result.get("draft_main_content"), draft_result.get("draft_short_description"), draft_result.get("draft_social_caption"), draft_result.get("draft_hashtags"),
            json.dumps(review_result.get("grammar_issues", [])), review_result.get("quality_feedback"), json.dumps(review_result.get("unsupported_statements", [])), json.dumps(review_result.get("suggestions", [])), review_result.get("revised_content"),
            loc_result.get("target_language"), loc_result.get("translated_title"), loc_result.get("translated_content"), loc_result.get("translated_caption"),
            comp_result.get("compliance_status"), comp_result.get("brand_tone_check"), json.dumps(comp_result.get("prohibited_words_found", [])), json.dumps(comp_result.get("unsupported_claims", [])), json.dumps(comp_result.get("regulatory_concerns", [])), comp_result.get("compliance_details")
        ))

        # Log audit records
        audit_entries = [
            (workflow_id, "Draft Agent", "DRAFT", json.dumps({"name": payload.name}), json.dumps(draft_result), draft_ms, "SUCCESS"),
            (workflow_id, "Review Agent", "REVIEW", json.dumps({"draft_title": draft_result.get("draft_title")}), json.dumps(review_result), review_ms, "SUCCESS"),
            (workflow_id, "Localization Agent", "LOCALIZATION", json.dumps({"target_lang": target_lang}), json.dumps(loc_result), loc_ms, "SUCCESS"),
            (workflow_id, "Compliance Agent", "COMPLIANCE", json.dumps({"title": draft_result.get("draft_title")}), json.dumps(comp_result), comp_ms, "SUCCESS"),
        ]
        c.executemany("""
        INSERT INTO agent_audit_logs (workflow_id, agent_name, stage, input_data, output_data, execution_time_ms, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, audit_entries)

        conn.commit()
        conn.close()

        return {
            "success": True,
            "message": "Multi-agent content workflow completed successfully and submitted for manager approval.",
            "workflow_id": workflow_id,
            "product_id": product_id,
            "status": "PENDING_APPROVAL",
            "draft": draft_result,
            "review": review_result,
            "localization": loc_result,
            "compliance": comp_result
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Agent workflow pipeline failed: {str(e)}")


@app.get("/api/agents/workflows")
def list_agent_workflows():
    conn = get_workflow_db()
    c = conn.cursor()
    c.execute("""
    SELECT w.*, p.name as product_name, p.category as product_category, p.content_objective
    FROM workflows w
    JOIN products p ON w.product_id = p.id
    ORDER BY w.created_at DESC
    """)
    rows = c.fetchall()
    conn.close()
    return {
        "success": True,
        "workflows": [dict(r) for r in rows]
    }


@app.get("/api/agents/workflows/{workflow_id}")
def get_workflow_details(workflow_id: str):
    conn = get_workflow_db()
    c = conn.cursor()
    c.execute("""
    SELECT w.*, p.name as product_name, p.description as product_description, p.specs, p.features,
           p.target_audience, p.customer_feedback, p.content_objective, p.preferred_language
    FROM workflows w
    JOIN products p ON w.product_id = p.id
    WHERE w.id = ?
    """, (workflow_id,))
    wf = c.fetchone()
    if not wf:
        conn.close()
        raise HTTPException(status_code=404, detail="Workflow not found.")

    c.execute("SELECT * FROM agent_audit_logs WHERE workflow_id = ? ORDER BY id ASC", (workflow_id,))
    logs = [dict(r) for r in c.fetchall()]
    conn.close()

    wf_dict = dict(wf)
    wf_dict["audit_logs"] = logs
    return {
        "success": True,
        "workflow": wf_dict
    }


@app.post("/api/agents/approve")
def approve_or_reject_workflow(payload: ApprovalRequest):
    conn = get_workflow_db()
    c = conn.cursor()
    c.execute("SELECT * FROM workflows WHERE id = ?", (payload.workflow_id,))
    wf = c.fetchone()
    if not wf:
        conn.close()
        raise HTTPException(status_code=404, detail="Workflow not found.")

    new_stage = "PUBLISHING" if payload.status == "APPROVED" else "REJECTED"
    c.execute("""
    UPDATE workflows
    SET approval_status = ?, approved_by = ?, approval_comments = ?, approved_at = CURRENT_TIMESTAMP,
        current_stage = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    """, (payload.status, payload.approved_by, payload.comments, new_stage, payload.status, payload.workflow_id))

    c.execute("""
    INSERT INTO agent_audit_logs (workflow_id, agent_name, stage, input_data, output_data, execution_time_ms, status)
    VALUES (?, 'Human Approval', 'HUMAN_APPROVAL', ?, ?, 0, ?)
    """, (payload.workflow_id, json.dumps({"decision": payload.status, "reviewer": payload.approved_by}), payload.comments or "", payload.status))

    conn.commit()
    conn.close()
    return {
        "success": True,
        "message": f"Workflow {payload.status.lower()} by manager {payload.approved_by}.",
        "workflow_id": payload.workflow_id,
        "status": payload.status
    }


@app.post("/api/agents/publish")
def publish_content(payload: PublishRequest):
    try:
        result = run_publishing_agent(payload.workflow_id, payload.channels, payload.scheduled_at)
        return {
            "success": True,
            "message": "Publishing executed.",
            "data": result
        }
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/agents/intelligence")
def get_content_intelligence():
    try:
        report = run_content_intelligence_agent()
        return {
            "success": True,
            "data": report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/agents/compliance-rules")
def get_compliance_rules():
    conn = get_workflow_db()
    c = conn.cursor()
    c.execute("SELECT * FROM compliance_rules ORDER BY id DESC LIMIT 1")
    row = c.fetchone()
    conn.close()
    return {
        "success": True,
        "rules": dict(row) if row else {}
    }


@app.post("/api/agents/compliance-rules")
def update_compliance_rules(payload: ComplianceRulesRequest):
    conn = get_workflow_db()
    c = conn.cursor()
    c.execute("""
    INSERT INTO compliance_rules (rule_key, brand_guidelines, company_terminology, restricted_words, required_disclaimers, regulatory_rules)
    VALUES ('custom', ?, ?, ?, ?, ?)
    """, (payload.brand_guidelines, payload.company_terminology, payload.restricted_words, payload.required_disclaimers, payload.regulatory_rules))
    conn.commit()
    conn.close()
    return {
        "success": True,
        "message": "Compliance rules & brand guidelines updated successfully."
    }


@app.get("/api/agents/platforms")
def list_platforms():
    conn = get_workflow_db()
    c = conn.cursor()
    c.execute("SELECT platform_id, platform_name, is_connected, account_name, updated_at FROM platform_connections")
    platforms = [dict(r) for r in c.fetchall()]
    conn.close()
    return {
        "success": True,
        "platforms": platforms
    }


@app.post("/api/agents/platforms/connect")
def connect_platform(payload: PlatformConnectRequest):
    conn = get_workflow_db()
    c = conn.cursor()
    c.execute("""
    UPDATE platform_connections
    SET is_connected = 1, account_name = ?, credentials_json = ?, updated_at = CURRENT_TIMESTAMP
    WHERE platform_id = ?
    """, (payload.account_name, payload.credentials, payload.platform_id))
    conn.commit()
    conn.close()
    return {
        "success": True,
        "message": f"Connected platform {payload.platform_id} successfully."
    }



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

