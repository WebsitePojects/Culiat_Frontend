import axios from 'axios';

// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Reports API
export const reportAPI = {
  create: (data) => api.post('/api/reports', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getAll: () => api.get('/api/reports'),
  getMyReports: () => api.get('/api/reports/my-reports'),
  getById: (id) => api.get(`/api/reports/${id}`),
  updateStatus: (id, data) => api.put(`/api/reports/${id}/status`, data),
  addComment: (id, data) => api.post(`/api/reports/${id}/comments`, data),
  delete: (id) => api.delete(`/api/reports/${id}`),
};

// Announcements API
export const announcementAPI = {
  create: (data) => api.post('/api/announcements', data),
  getAll: () => api.get('/api/announcements/all'),
  getPublished: () => api.get('/api/announcements'),
  getById: (id) => api.get(`/api/announcements/${id}`),
  update: (id, data) => api.put(`/api/announcements/${id}`, data),
  togglePublish: (id) => api.put(`/api/announcements/${id}/publish`),
  delete: (id) => api.delete(`/api/announcements/${id}`),
};

// Feedback API
export const feedbackAPI = {
  create: (data) => api.post('/api/feedback', data),
};

// Documents API
export const documentsAPI = {
  getTemplates: () => api.get('/api/documents/templates'),
  checkStatus: (requestId) => api.get(`/api/documents/status/${requestId}`),
  download: (requestId) => api.get(`/api/documents/download/${requestId}`, { responseType: 'blob' }),
};

// Payments API
export const paymentsAPI = {
  getDetails: (requestId) => api.get(`/api/payments/details/${requestId}`),
  createPaymentLink: (requestId) => api.post('/api/payments/create-link', { requestId }),
  verifyPayment: (requestId) => api.get(`/api/payments/verify/${requestId}`),
};

export default api;

