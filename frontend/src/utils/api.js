const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class APIError extends Error {
  constructor(status, message, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Make an API request
 * @param {string} endpoint - API endpoint (e.g., '/api/auth/me')
 * @param {Object} options - Fetch options
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new APIError(
        response.status,
        data.message || data.error || 'An error occurred',
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      0,
      'Network error. Please check your connection.',
      { originalError: error }
    );
  }
}

// Auth API
export const authAPI = {
  getMe: () => apiRequest('/api/auth/me'),
};

// Profile API
export const profileAPI = {
  getProfile: () => apiRequest('/api/profile'),
  updateProfile: (data) => apiRequest('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Certificates API
export const certificatesAPI = {
  create: (data) => apiRequest('/api/certificates', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  createBulk: (certificates) => apiRequest('/api/certificates/bulk', {
    method: 'POST',
    body: JSON.stringify({ certificates }),
  }),
  
  list: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/certificates${queryString ? '?' + queryString : ''}`);
  },
  
  validate: (uniqueId) => apiRequest(`/api/validate/${uniqueId}`),
};

export default {
  authAPI,
  profileAPI,
  certificatesAPI,
};
