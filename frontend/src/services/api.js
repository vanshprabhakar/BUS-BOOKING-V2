import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to request headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
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
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  logout: () => api.post('/auth/logout')
};

// Bus APIs
export const busAPI = {
  getAllBuses: (params) => api.get('/buses', { params }),
  getBusById: (id) => api.get(`/buses/${id}`),
  getBusSeats: (id, date) => api.get(`/buses/${id}/seats/${date}`),
  searchBuses: (data) => api.post('/buses/search', data),
  getPopularRoutes: () => api.get('/buses/popular-routes')
};

// Booking APIs
export const bookingAPI = {
  createBooking: (data) => api.post('/bookings/create', data),
  getMyBookings: (params) => api.get('/bookings/my', { params }),
  getBookingDetails: (id) => api.get(`/bookings/${id}`),
  confirmBooking: (id, data) => api.post(`/bookings/${id}/confirm`, data),
  cancelBooking: (id, data) => api.post(`/bookings/${id}/cancel`, data)
};

// Admin APIs
export const adminAPI = {
  addBus: (data) => api.post('/admin/buses', data),
  updateBus: (id, data) => api.put(`/admin/buses/${id}`, data),
  deleteBus: (id) => api.delete(`/admin/buses/${id}`),
  getAllBookings: (params) => api.get('/admin/bookings', { params }),
  getAnalytics: () => api.get('/admin/analytics'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, data) => api.put(`/admin/users/${id}/role`, data)
};

export default api;
