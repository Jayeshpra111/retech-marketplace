// client/src/services/api.js — Modern unified API client for Retech Market
const API_BASE = '/api/v1';

const getAuthToken = () => localStorage.getItem('retech_token');

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('retech_token', token);
  } else {
    localStorage.removeItem('retech_token');
  }
};

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // If body is FormData, don't set Content-Type
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `API error (${response.status})`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () => request('/users/me'),
    updateProfile: (userData) => request('/users/me', { method: 'PATCH', body: JSON.stringify(userData) }),
  },
  listings: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/listings${qs ? `?${qs}` : ''}`);
    },
    getCategories: () => request('/listings/categories'),
    getById: (id) => request(`/listings/${id}`),
    create: (listingData) => request('/listings', { method: 'POST', body: JSON.stringify(listingData) }),
    update: (id, listingData) => request(`/listings/${id}`, { method: 'PATCH', body: JSON.stringify(listingData) }),
    delete: (id) => request(`/listings/${id}`, { method: 'DELETE' }),
    toggleWishlist: (id) => request(`/listings/${id}/wishlist`, { method: 'POST' }),
    getMyListings: () => request('/listings/my'),
  },
  orders: {
    create: (orderData) => request('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
    getMyOrders: () => request('/orders/my'),
    getById: (id) => request(`/orders/${id}`),
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
  },
  admin: {
    getStats: () => request('/admin/stats'),
    getPendingListings: () => request('/admin/listings'),
    approveListing: (id) => request(`/admin/listings/${id}/approve`, { method: 'PATCH' }),
    rejectListing: (id, reason) => request(`/admin/listings/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
    getReports: () => request('/admin/reports'),
    resolveReport: (id) => request(`/admin/reports/${id}`, { method: 'PATCH' }),
  },
};

export default api;
