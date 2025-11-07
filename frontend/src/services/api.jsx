import axios from 'axios';

const API = axios.create({
  // baseURL: 'http://localhost:5000/api',
  baseURL: "https://gigconnect-jd3a.onrender.com/api",
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


// Auth APIs
export const login = async (email, password) => {
  const response = await API.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (username, email, password, role) => {
  const response = await API.post('/auth/register', {
    username,
    email,
    password,
    role,
  });
  return response.data;
};

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

// Profile API calls
export const getProfile = async () => {
  const response = await API.get('/users/profiles');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await API.put('/users/profiles', profileData);
  return response.data;
};

// Message API
export const getMyConversations = async () => {
  const response = await API.get('/messages/conversations');
  return response.data;
};

export const getMessages = async (conversationId) => {
  const response = await API.get(`/messages/conversations/${conversationId}`);
  return response.data;
};

export const sendMessage = async (messageData) => {
  const response = await API.post('/messages', messageData);
  return response.data;
};

export const startConversation = async (receiverId, gigId = null) => {
  const response = await API.post('/messages/conversations/start', { 
    receiverId, 
    gigId 
  });
  return response.data;
};

// Payment API
export const createPaymentIntent = async (paymentData) => {
  const response = await API.post('/payments/create-intent', paymentData);
  return response.data;
};

export const confirmPayment = async (confirmationData) => {
  const response = await API.post('/payments/confirm', confirmationData);
  return response.data;
};

export const getClientPayments = async () => {
  const response = await API.get('/payments/client/my-payments');
  return response.data;
};

export const getFreelancerPayments = async () => {
  const response = await API.get('/payments/freelancer/my-payments');
  return response.data;
};

export const updateApplicationStatus = async (gigId, statusData) => {
  const response = await API.put(`/gigs/${gigId}/application-status`, statusData);
  return response.data;
};

//review api
export const createReview = async (reviewData) => {
  const response = await API.post('/reviews', reviewData);
  return response.data;
};

export const getGigReviews = async (gigId) => {
  const response = await API.get(`/reviews/gig/${gigId}`);
  return response.data;
};

export const getUserReviews = async (userId) => {
  const response = await API.get(`/reviews/user/${userId}`);
  return response.data;
};

export const getMyReviews = async () => {
  const response = await API.get('/reviews/my-reviews');
  return response.data;
};

export const updateReview = async (reviewId, reviewData) => {
  const response = await API.put(`/reviews/${reviewId}`, reviewData);
  return response.data;
};

export const deleteReview = async (reviewId) => {
  const response = await API.delete(`/reviews/${reviewId}`);
  return response.data;
};

export default API;