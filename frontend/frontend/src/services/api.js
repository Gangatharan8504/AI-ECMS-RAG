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

// ============================================================
// MULTI-AGENT CONTENT AUTOMATION API
// ============================================================

export const runAgentWorkflow = async (productData) => {
  const response = await api.post("/api/agents/products", productData);
  return response.data;
};

export const listAgentWorkflows = async () => {
  const response = await api.get("/api/agents/workflows");
  return response.data;
};

export const getWorkflowDetails = async (workflowId) => {
  const response = await api.get(`/api/agents/workflows/${workflowId}`);
  return response.data;
};

export const submitManagerApproval = async (workflowId, status, approvedBy, comments) => {
  const response = await api.post("/api/agents/approve", {
    workflow_id: workflowId,
    status,
    approved_by: approvedBy,
    comments,
  });
  return response.data;
};

export const publishAgentContent = async (workflowId, channels, scheduledAt = null) => {
  const response = await api.post("/api/agents/publish", {
    workflow_id: workflowId,
    channels,
    scheduled_at: scheduledAt,
  });
  return response.data;
};

export const getContentIntelligence = async () => {
  const response = await api.get("/api/agents/intelligence");
  return response.data;
};

export const getComplianceRules = async () => {
  const response = await api.get("/api/agents/compliance-rules");
  return response.data;
};

export const updateComplianceRules = async (rules) => {
  const response = await api.post("/api/agents/compliance-rules", rules);
  return response.data;
};

export const listPlatforms = async () => {
  const response = await api.get("/api/agents/platforms");
  return response.data;
};

export const connectPlatform = async (platformId, accountName, credentials = "") => {
  const response = await api.post("/api/agents/platforms/connect", {
    platform_id: platformId,
    account_name: accountName,
    credentials,
  });
  return response.data;
};

export default api;
