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
  create: (data) => api.post('/reports', data),
  getAll: () => api.get('/reports'),
  getMyReports: () => api.get('/reports/my-reports'),
  getById: (id) => api.get(`/reports/${id}`),
  updateStatus: (id, data) => api.put(`/reports/${id}/status`, data),
  addComment: (id, data) => api.post(`/reports/${id}/comments`, data),
  delete: (id) => api.delete(`/reports/${id}`),
};

// Announcements API
export const announcementAPI = {
  create: (data) => api.post('/announcements', data),
  getAll: () => api.get('/announcements/all'),
  getPublished: () => api.get('/announcements'),
  getById: (id) => api.get(`/announcements/${id}`),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  togglePublish: (id) => api.put(`/announcements/${id}/publish`),
  delete: (id) => api.delete(`/announcements/${id}`),
};

// Feedback API
export const feedbackAPI = {
  create: (data) => api.post('/feedback', data),
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

