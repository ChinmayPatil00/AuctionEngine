import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding JWT token and API keys
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const geminiKey = localStorage.getItem('geminiKey');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (geminiKey) {
      config.headers['x-gemini-key'] = geminiKey;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
