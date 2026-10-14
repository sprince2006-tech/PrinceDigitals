/**
 * API Service for Prince Digital
 * Handles HTTP-only cookie credentials and Authorization Bearer fallback.
 */

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '');

// Token storage key for Safari / cross-domain third-party cookie restrictions
const TOKEN_STORAGE_KEY = 'prince_auth_token';

export const getStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (_) {
    return null;
  }
};

export const setStoredToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch (_) {}
};

export const clearStoredToken = () => {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (_) {}
};

/**
 * Universal fetch wrapper with timeout, AbortController, and error handling
 */
async function apiRequest(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const headers = {
    Accept: 'application/json',
    ...options.headers,
  };

  // Attach token header if available as fallback for cross-site cookie restrictions
  const token = getStoredToken();
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Do not set Content-Type for FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // AbortController with 15-second default timeout to prevent infinite loading screens
  const timeoutMs = options.timeout || 15000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Ensures HTTP-only cookies are sent with requests
      signal: options.signal || controller.signal,
    });

    clearTimeout(timer);

    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' && data?.message) ||
        (typeof data === 'string' && data) ||
        `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    clearTimeout(timer);

    if (err.name === 'AbortError') {
      const timeoutErr = new Error('Request timed out. Please check your network connection and try again.');
      timeoutErr.status = 408;
      throw timeoutErr;
    }

    if (err instanceof TypeError && err.message.includes('fetch')) {
      const networkErr = new Error('Unable to connect to the Prince Digital API server. Please verify your connection.');
      networkErr.status = 0;
      throw networkErr;
    }

    throw err;
  }
}

// ----------------------------------------------------
// Public Catalog API
// ----------------------------------------------------
export const publicApi = {
  getCollections: () => apiRequest('/collections', { method: 'GET' }),
  getCollectionBySlug: (slug) => apiRequest(`/collections/${encodeURIComponent(slug)}`, { method: 'GET' }),
};

// ----------------------------------------------------
// Authentication API
// ----------------------------------------------------
export const authApi = {
  getSession: () => apiRequest('/auth/me', { method: 'GET' }),
  login: (identifier, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: identifier, username: identifier, password }),
    }),
  register: (name, email, password) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getGoogleAuthUrl: () => `${API_BASE_URL}/auth/google`,
};

// ----------------------------------------------------
// Admin API (Collections, Products, Dashboard)
// ----------------------------------------------------
export const adminApi = {
  // Dashboard stats
  getDashboard: () => apiRequest('/admin/dashboard', { method: 'GET' }),

  // Collections
  getCollections: () => apiRequest('/admin/collections', { method: 'GET' }),
  getCollection: (id) => apiRequest(`/admin/collections/${id}`, { method: 'GET' }),
  createCollection: (formData) =>
    apiRequest('/admin/collections', {
      method: 'POST',
      body: formData, // FormData or JSON
    }),
  updateCollection: (id, payload) =>
    apiRequest(`/admin/collections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  updateCollectionCover: (id, formData) =>
    apiRequest(`/admin/collections/${id}/cover`, {
      method: 'POST',
      body: formData,
    }),
  deleteCollection: (id) => apiRequest(`/admin/collections/${id}`, { method: 'DELETE' }),
  reorderCollections: (orderedIds) =>
    apiRequest('/admin/collections/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ orderedIds }),
    }),

  // Products
  getProducts: (collectionId) => apiRequest(`/admin/collections/${collectionId}/products`, { method: 'GET' }),
  createProduct: (collectionId, formData) =>
    apiRequest(`/admin/collections/${collectionId}/products`, {
      method: 'POST',
      body: formData,
    }),
  updateProduct: (id, payload) =>
    apiRequest(`/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  updateProductImage: (id, formData) =>
    apiRequest(`/admin/products/${id}/image`, {
      method: 'POST',
      body: formData,
    }),
  deleteProduct: (id) => apiRequest(`/admin/products/${id}`, { method: 'DELETE' }),
  reorderProducts: (collectionId, orderedIds) =>
    apiRequest(`/admin/collections/${collectionId}/products/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ orderedIds }),
    }),
};
