# AI ECMS — AI-Based College Enterprise Content Management System

AI ECMS is an enterprise-grade AI-powered content management and document intelligence system built for colleges and academic institutions. It provides document grounding, PDF text extraction, OCR fallback, FAISS semantic vector search, Groq LLM-powered question answering, executive summaries, risk identification, and multi-language translation.

---

## 🚀 Features

- 📄 **Document Management & PDF Extraction**: Upload academic, examination, placement, and policy PDFs with automatic text extraction and Tesseract OCR fallback for scanned documents.
- ⚡ **RAG Semantic Search & FAISS Indexing**: SentenceTransformers embeddings (`all-MiniLM-L6-v2`) with cosine similarity FAISS vector indexing.
- 🤖 **AI Assistant (Grounded Q&A)**: Ask natural language questions grounded strictly in the uploaded document with exact page citations and similarity scores.
- 📊 **Executive Summary & Key Topics**: AI generates 5 concise key points and extracted core topics per document.
- 🛡️ **Risk & Content Quality Analysis**: Flags missing regulations, conflicting clauses, and compliance considerations.
- 🌐 **Multi-Language Translation**: Instant translation into Tamil, Hindi, Telugu, Malayalam, Kannada, French, German, and Spanish with speech audio playback.
- ✨ **Lottie Ambient Animations & Rose Dark/Light Theme**: Non-intrusive animated background with 100% responsive modern SaaS styling.

---

## 🛠️ Architecture

- **Frontend**: React 19 + Vite + React Router + Lucide Icons + Lottie React
- **Backend**: FastAPI + Uvicorn + Pydantic
- **AI / RAG Pipeline**: PyMuPDF + pytesseract + SentenceTransformers + FAISS + Groq Cloud API (`openai/gpt-oss-120b`)

---

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Gangatharan8504/AI-ECMS-RAG.git
cd AI-ECMS-RAG
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
```

### 3. Backend Setup
```bash
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 4. Frontend Setup
```bash
cd frontend/frontend
npm install
npm run dev
```
Frontend UI: [http://localhost:5173](http://localhost:5173)

---

## 🐳 Docker Deployment
```bash
docker-compose up -d --build
```
The full-stack application will be live on `http://localhost:8000`.

---

## 📄 License
MIT License
