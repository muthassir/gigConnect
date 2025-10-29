import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

API.interceptors.request.use(
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

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

//gig apis
export const fetchGigs = async (params = {}) => {
  const response = await API.get('/gigs', { params });
  return response.data;
};

export const searchGigs = async (params = {}) => {
  const response = await API.get('/gigs/search', { params });
  return response.data;
};

export const fetchGig = async (id) => {
  const response = await API.get(`/gigs/${id}`);
  return response.data;
};

export const applyToGig = async (gigId, application) => {
  const response = await API.post(`/gigs/${gigId}/apply`, application);
  return response.data;
};

export const createGig = async (gigData) => {
  const response = await API.post('/gigs', gigData);
  return response.data;
};

export const getMyGigs = async () => {
  const response = await API.get('/gigs/client/my-gigs');
  return response.data;
};

export const getMyApplications = async () => {
  const response = await API.get('/gigs/freelancer/my-applications');
  return response.data;
};


export const updateGigStatus = async (gigId, statusData) => {
  const response = await API.put(`/gigs/${gigId}/status`, statusData);
  return response.data;
};

export const deleteGig = async (gigId) => {
  const response = await API.delete(`/gigs/${gigId}`);
  return response.data;
};

export default API;