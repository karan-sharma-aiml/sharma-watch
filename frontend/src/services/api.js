import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // FormData ho to Content-Type mat set karo
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      if (!path.includes('/login') && !path.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ───────────────────────────────────────────
export const authAPI = {
  // Registration flow
  sendOTP:              (data)  => api.post('/auth/send-otp', data),
  verifyOTP:            (data)  => api.post('/auth/verify-otp', data),
  completeRegistration: (data)  => api.post('/auth/complete-registration', data),
  checkEmail:           (email) => api.get('/auth/check-email', { params: { email } }),

  // Auth
  login:              (data)  => api.post('/auth/login', data),
  getMe:              ()      => api.get('/auth/me'),
  forgotPassword:     (email) => api.post('/auth/forgot-password', { email }),
  verifyEmail:        (token) => api.post('/auth/verify-email', { token }),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  resetPassword:      (data)  => api.post('/auth/reset-password', data),

  updateProfile: (data) => api.put('/auth/profile', data),
};


// ── Products ───────────────────────────────────────
export const productsAPI = {
  getAll:            (params)   => api.get('/products', { params }),
  getById:           (id)       => api.get(`/products/${id}`),
  create:            (data)     => api.post('/products', data),
  update:            (id, d)    => api.put(`/products/${id}`, d),
  remove:            (id)       => api.delete(`/products/${id}`),
  bulkDelete:        (data)     => api.post('/products/bulk-delete', data),
  bulkStatus:        (data)     => api.patch('/products/bulk-status', data),
  getDashboardStats: ()         => api.get('/products/dashboard-stats'),
};

// ── Categories ─────────────────────────────────────
export const categoriesAPI = {
  getAll: ()       => api.get('/categories'),
  create: (data)   => api.post('/categories', data),
  update: (id, d)  => api.put(`/categories/${id}`, d),
  remove: (id)     => api.delete(`/categories/${id}`),
};

// ── Cart ───────────────────────────────────────────
export const cartAPI = {
  get:    ()                    => api.get('/cart'),
  add:    (productId, quantity) => api.post('/cart/add', { productId, quantity }),
  update: (productId, quantity) => api.put('/cart/update', { productId, quantity }),
  remove: (productId)           => api.delete(`/cart/remove/${productId}`),
};

// ── Wishlist ───────────────────────────────────────
export const wishlistAPI = {
  get:    ()          => api.get('/wishlist'),
  add:    (productId) => api.post('/wishlist/add', { productId }),
  remove: (productId) => api.delete(`/wishlist/remove/${productId}`),
};

// ── Orders ─────────────────────────────────────────
export const ordersAPI = {
  create:       (data)       => api.post('/orders', data),
  getMyOrders:  (params)     => api.get('/orders/my-orders', { params }),
  getAll:       (params)     => api.get('/orders', { params }),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// ── Contact ────────────────────────────────────────
export const contactAPI = {
  submit: (data)   => api.post('/contact', data),
  getAll: (params) => api.get('/contact', { params }),
};

export default api;