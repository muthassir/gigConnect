
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

export const fetchGigs = (params) => api.get('/gigs', { params });
export const fetchGigById = (id) => api.get(`/gigs/${id}`);
export const sendMessage = (payload) => api.post('/messages', payload);

export default api;
