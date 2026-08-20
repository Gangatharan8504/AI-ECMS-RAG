# ============================================================
# STAGE 1: Build React Frontend
# ============================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/frontend/package*.json ./
RUN npm ci
COPY frontend/frontend/ ./
RUN npm run build

# ============================================================
# STAGE 2: Python FastAPI Backend + RAG Engine
# ============================================================
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including Tesseract OCR for scanned PDF support
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
    libgl1 \
    libglib2.0-0 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY main.py .
COPY rag_engine.py .

# Copy built frontend assets from stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/frontend/dist

# Expose port (default 8000 or Render/Railway PORT)
ENV PORT=8000
EXPOSE 8000

# Start FastAPI server
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
