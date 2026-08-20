# 🚀 AI ECMS Deployment & Hosting Guide

This guide provides 3 proven ways to host your **AI ECMS** full-stack application (React + FastAPI + RAG Engine + FAISS + Groq).

---

## 🌟 Quick Summary of Hosting Options

| Hosting Approach | Frontend | Backend | Best For | Difficulty |
|---|---|---|---|---|
| **Option 1 (Recommended)** | **Render.com / Railway (Docker)** | **Same Container** | Simplest 1-click deployment, 1 URL, 0 CORS configuration | ⭐ Easy |
| **Option 2 (High Performance)** | **Vercel / Netlify** | **Render / Railway** | Global CDN for React + Scalable Python API | ⭐⭐ Moderate |
| **Option 3 (Self-Hosted)** | **VPS / Docker Compose** | **VPS / Docker Compose** | Complete privacy, custom domain, full control | ⭐⭐⭐ Advanced |

---

## 🔹 Option 1: 1-Click All-in-One Hosting (Render.com)

With the included multi-stage `Dockerfile`, your React frontend and FastAPI backend build and run together as a single web service.

### Step 1: Push your code to GitHub
```bash
git init
git add .
git commit -m "Deploy AI ECMS"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/AI-ECMS.git
git push -u origin main
```

### Step 2: Deploy on Render
1. Go to [https://render.com](https://render.com) and log in.
2. Click **New +** ➔ **Web Service**.
3. Connect your GitHub repository: `AI-ECMS`.
4. Render will automatically detect the `Dockerfile` or `render.yaml`.
5. Configure Environment Variables:
   - `GROQ_API_KEY`: Your Groq API key (`gsk_...`)
   - `GROQ_MODEL`: `openai/gpt-oss-120b`
6. Click **Create Web Service**.
7. Render will build both the React UI and Python API and give you a live URL: `https://ai-ecms-xxxx.onrender.com`.

---

## 🔹 Option 2: Split Hosting (Vercel + Render)

### Backend on Render:
1. Push your repository to GitHub.
2. On Render.com: Click **New +** ➔ **Web Service**.
3. Select your repository.
4. Set:
   - **Environment**: `Python` or `Docker`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   - `GROQ_API_KEY`: `gsk_...`
   - `GROQ_MODEL`: `openai/gpt-oss-120b`
6. Note down your backend URL, for example: `https://ai-ecms-backend.onrender.com`.

### Frontend on Vercel:
1. Go to [https://vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** ➔ **Project**.
3. Import your GitHub repository.
4. Configure the project:
   - **Root Directory**: `frontend/frontend`
   - **Framework Preset**: `Vite`
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://ai-ecms-backend.onrender.com` (Your live backend URL)
6. Click **Deploy**.
7. Vercel deploys your React frontend to `https://ai-ecms.vercel.app` with instant global CDN caching.

---

## 🔹 Option 3: VPS / Docker Deployment (DigitalOcean, AWS, GCP, Linode)

If you have a Linux VPS (Ubuntu/Debian):

### Step 1: Install Docker & Docker Compose
```bash
sudo apt update && sudo apt install -y docker.io docker-compose
```

### Step 2: Clone and Configure
```bash
git clone https://github.com/YOUR_USERNAME/AI-ECMS.git
cd AI-ECMS
cp .env.example .env # or create .env with GROQ_API_KEY=...
```

### Step 3: Run with Docker Compose
```bash
docker-compose up -d --build
```
Your full-stack application will be live on `http://YOUR_SERVER_IP:8000`.

---

## 🔑 Required Environment Variables

| Variable | Description | Example |
|---|---|---|
| `GROQ_API_KEY` | Groq Cloud API Key | `gsk_...` |
| `GROQ_MODEL` | Groq Model for Q&A, summary, topics & translation | `openai/gpt-oss-120b` |
| `VITE_API_URL` *(Only for separate frontend hosting)* | URL of deployed FastAPI backend | `https://your-api.onrender.com` |
