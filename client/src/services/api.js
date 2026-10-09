// client/src/services/api.js — Modern unified API client with 401 refresh retry
const RAW_API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') : '';
const API_BASE = RAW_API_URL
  ? (RAW_API_URL.endsWith('/api/v1') ? RAW_API_URL : `${RAW_API_URL}/api/v1`)
  : '/api/v1';

export const getAuthToken = () => localStorage.getItem('retech_token');

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('retech_token', token);
  } else {
    localStorage.removeItem('retech_token');
  }
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

async function request(endpoint, options = {}, isRetry = false) {
  const token = getAuthToken();
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Only set Content-Type if not FormData and not already set
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      credentials: 'include', // Automatically send cookies (refresh token)
      headers,
    });

    // Handle 401 Unauthorized with token refresh (once per request)
    if (response.status === 401 && !isRetry && !endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/refresh')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          return request(endpoint, options, true);
        });
      }

      isRefreshing = true;

      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newToken = refreshData.data?.accessToken;
          if (newToken) {
            setAuthToken(newToken);
            processQueue(null, newToken);
            isRefreshing = false;
            return request(endpoint, options, true);
          }
        }

        // If refresh failed
        processQueue(new Error('Session expired'), null);
        setAuthToken(null);
        isRefreshing = false;
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setAuthToken(null);
        isRefreshing = false;
      }
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || `API error (${response.status})`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    refreshToken: () => request('/auth/refresh', { method: 'POST' }),
    getMe: () => request('/users/me'),
    updateProfile: (userData) => request('/users/me', { method: 'PATCH', body: JSON.stringify(userData) }),
    updateAvatar: (formData) => request('/users/me/avatar', { method: 'PATCH', body: formData }),
    getUserProfile: (userId) => request(`/users/${userId}`),
    verifyEmail: (token) => request(`/auth/verify-email/${token}`),
    forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword: (token, password) => request(`/auth/reset-password/${token}`, { method: 'POST', body: JSON.stringify({ password }) }),
  },
  listings: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/listings${qs ? `?${qs}` : ''}`);
    },
    getCategories: () => request('/listings/categories'),
    getById: (id) => request(`/listings/${id}`),
    create: (formDataOrObj) =>
      request('/listings', {
        method: 'POST',
        body: formDataOrObj instanceof FormData ? formDataOrObj : JSON.stringify(formDataOrObj),
      }),
    update: (id, formDataOrObj) =>
      request(`/listings/${id}`, {
        method: 'PATCH',
        body: formDataOrObj instanceof FormData ? formDataOrObj : JSON.stringify(formDataOrObj),
      }),
    delete: (id) => request(`/listings/${id}`, { method: 'DELETE' }),
    toggleWishlist: (id) => request(`/listings/${id}/wishlist`, { method: 'POST' }),
    getWishlist: () => request('/listings/wishlist'),
    getMyListings: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/listings/my${qs ? `?${qs}` : ''}`);
    },
    getHealthReport: (id) => request(`/listings/${id}/health-report`),
    createHealthReport: (id, formDataOrObj) =>
      request(`/listings/${id}/health-report`, {
        method: 'POST',
        body: formDataOrObj instanceof FormData ? formDataOrObj : JSON.stringify(formDataOrObj),
      }),
    updateHealthReport: (id, formDataOrObj) =>
      request(`/listings/${id}/health-report`, {
        method: 'PATCH',
        body: formDataOrObj instanceof FormData ? formDataOrObj : JSON.stringify(formDataOrObj),
      }),
    verifyHealthReport: (id, isVerified = true) =>
      request(`/listings/${id}/health-report/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ isVerified }),
      }),
  },
  offers: {
    create: (data) => request('/offers', { method: 'POST', body: JSON.stringify(data) }),
    getMyOffers: () => request('/offers/my'),
    getListingOffers: (listingId) => request(`/offers/listing/${listingId}`),
    respond: (offerId, data) => request(`/offers/${offerId}/respond`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  orders: {
    create: (orderData) => request('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
    getMyOrders: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/orders/my${qs ? `?${qs}` : ''}`);
    },
    getSellingOrders: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/orders/selling${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => request(`/orders/${id}`),
    updateStatus: (id, data) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
    confirmDelivery: (id) => request(`/orders/${id}/confirm-delivery`, { method: 'POST' }),
    cancel: (id) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'cancelled' }) }),
    delete: (id) => request(`/orders/${id}`, { method: 'DELETE' }),
  },
  payments: {
    create: (orderId) => request('/payments/create', { method: 'POST', body: JSON.stringify({ orderId }) }),
    verify: (paymentData) => request('/payments/verify', { method: 'POST', body: JSON.stringify(paymentData) }),
  },
  disputes: {
    create: (data) => request('/disputes', { method: 'POST', body: JSON.stringify(data) }),
    getMy: () => request('/disputes/my'),
    getById: (id) => request(`/disputes/${id}`),
    resolve: (id, data) => request(`/disputes/${id}/resolve`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  chat: {
    getConversations: () => request('/chat/conversations'),
    createConversation: (participantId, listingId) =>
      request('/chat/conversations', { method: 'POST', body: JSON.stringify({ participantId, listingId }) }),
    getMessages: (conversationId, params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/chat/conversations/${conversationId}/messages${qs ? `?${qs}` : ''}`);
    },
    sendMessage: (conversationId, text) =>
      request(`/chat/conversations/${conversationId}/messages`, { method: 'POST', body: JSON.stringify({ text }) }),
  },
  reviews: {
    create: (reviewData) => request('/reviews', { method: 'POST', body: JSON.stringify(reviewData) }),
    getBySeller: (sellerId) => request(`/reviews/seller/${sellerId}`),
  },
  reports: {
    create: (reportData) => request('/reports', { method: 'POST', body: JSON.stringify(reportData) }),
  },
  impact: {
    getOverview: () => request('/impact/overview'),
    getUserImpact: (userId) => request(`/impact/user/${userId}`),
  },
  recyclers: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/recycling-centers${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => request(`/recycling-centers/${id}`),
  },
  admin: {
    getStats: () => request('/admin/stats'),
    getPendingListings: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/admin/listings${qs ? `?${qs}` : ''}`);
    },
    approveListing: (id) => request(`/admin/listings/${id}/approve`, { method: 'PATCH' }),
    rejectListing: (id, reason) =>
      request(`/admin/listings/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
    getReports: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/admin/reports${qs ? `?${qs}` : ''}`);
    },
    resolveReport: (id, resolution) =>
      request(`/admin/reports/${id}/resolve`, { method: 'PATCH', body: JSON.stringify({ resolution }) }),
    getUsers: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/admin/users${qs ? `?${qs}` : ''}`);
    },
    toggleBanUser: (id) => request(`/admin/users/${id}/ban`, { method: 'PATCH' }),
  },
};

export default api;
