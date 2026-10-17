import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL
    : import.meta.env.DEV
    ? "http://127.0.0.1:8000"
    : "";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes for large PDF processing / OCR / Groq
});

export const getHealth = async () => {
  const response = await api.get("/api/health");
  return response.data;
};

export const listDocuments = async () => {
  const response = await api.get("/api/documents");
  return response.data;
};

export const uploadDocument = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/api/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });
  return response.data;
};

export const getDocument = async (documentId) => {
  const response = await api.get(`/api/documents/${documentId}`);
  return response.data;
};

export const askDocument = async (documentId, question) => {
  const response = await api.post(`/api/documents/${documentId}/ask`, {
    question,
  });
  return response.data;
};

export const translateText = async (text, targetLanguage) => {
  const response = await api.post("/api/translate", {
    text,
    target_language: targetLanguage,
  });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await api.post("/api/auth/login", {
    email,
    password,
  });
  return response.data;
};

export const registerUser = async (name, email, password, role = "Student") => {
  const response = await api.post("/api/auth/register", {
    name,
    email,
    password,
    role,
  });
  return response.data;
};

export default api;
