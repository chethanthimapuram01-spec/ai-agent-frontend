// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  CHAT: `${API_BASE_URL}/api/chat`,
  UPLOAD: `${API_BASE_URL}/api/upload`,
  QUERY: `${API_BASE_URL}/api/query`,
};

export default API_BASE_URL;
