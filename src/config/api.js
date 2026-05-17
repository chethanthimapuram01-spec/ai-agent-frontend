// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  CHAT: `${API_BASE_URL}/chat`,
  UPLOAD_DOC: `${API_BASE_URL}/upload-doc`,
  QUERY_DOC: `${API_BASE_URL}/query-doc`,
  WORKFLOW: `${API_BASE_URL}/workflow`,
  WORKFLOW_TRACE: (taskId) => `${API_BASE_URL}/workflow-trace${taskId ? `/${taskId}` : ''}`,
};

export default API_BASE_URL;
