import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const BASE_URL = 'http://localhost:5000';

export const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/300?text=No+Photo';
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path}`;
};

export default api;
