import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    login: (data) => api.post('/login', data),
    register: (data) => api.post('/register', data),
    getProfile: () => api.get('/user-profile'),
};

export const healthService = {
    predictRisk: (data) => api.post('/predict-risk', data),
    getHistory: () => api.get('/history'),
};

export const adminService = {
    getAllUsers: () => api.get('/admin/all-users'),
    getAnalytics: () => api.get('/admin/analytics'),
};

export default api;
