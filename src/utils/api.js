import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// API Functions
export const api = {
  // Authentication APIs
  register: async (userData) => {
    console.log('API: Making register request to:', `${API_BASE_URL}/auth/register`);
    console.log('API: Register data:', userData);
    const response = await apiClient.post('/auth/register', userData);
    console.log('API: Register response:', response);
    return response;
  },

  login: async (credentials) => {
    console.log('API: Making login request to:', `${API_BASE_URL}/auth/login`);
    console.log('API: Login credentials:', credentials);
    const response = await apiClient.post('/auth/login', credentials);
    console.log('API: Login response:', response);
    return response;
  },

  logout: async () => {
    return await apiClient.post('/auth/logout');
  },

  getCurrentUser: async () => {
    return await apiClient.get('/auth/me');
  },

  updateProfile: async (profileData) => {
    return await apiClient.put('/auth/profile', profileData);
  },

  changePassword: async (passwordData) => {
    return await apiClient.put('/auth/change-password', passwordData);
  },

  // Course related APIs
  getCourses: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    return await apiClient.get(`/courses?${params.toString()}`);
  },

  getCourse: async (id) => {
    return await apiClient.get(`/courses/${id}`);
  },

  createCourse: async (courseData) => {
    return await apiClient.post('/courses', courseData);
  },

  updateCourse: async (id, courseData) => {
    return await apiClient.put(`/courses/${id}`, courseData);
  },

  publishCourse: async (id, publish) => {
    return await apiClient.put(`/courses/${id}/publish`, { publish });
  },

  deleteCourse: async (id) => {
    return await apiClient.delete(`/courses/${id}`);
  },

  getCoursesByInstructor: async (instructorId) => {
    return await apiClient.get(`/courses/instructor/${instructorId}`);
  },

  getCategories: async () => {
    return await apiClient.get('/courses/meta/categories');
  },

  // Enrollment APIs
  enrollInCourse: async (courseId, paymentData = {}) => {
    return await apiClient.post('/enrollments', {
      courseId,
      ...paymentData
    });
  },

  getEnrollments: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    return await apiClient.get(`/enrollments?${params.toString()}`);
  },

  getEnrollment: async (id) => {
    return await apiClient.get(`/enrollments/${id}`);
  },

  updateProgress: async (enrollmentId, progressData) => {
    return await apiClient.put(`/enrollments/${enrollmentId}/progress`, progressData);
  },

  issueCertificate: async (enrollmentId) => {
    return await apiClient.post(`/enrollments/${enrollmentId}/certificate`);
  },

  getCourseStudents: async (courseId) => {
    return await apiClient.get(`/enrollments/course/${courseId}/students`);
  },

  // Payment APIs
  createPaymentIntent: async (courseId, currency = 'usd') => {
    return await apiClient.post('/payments/create-payment-intent', {
      courseId,
      currency
    });
  },

  confirmEnrollment: async (paymentIntentId, courseId) => {
    return await apiClient.post('/payments/confirm-enrollment', {
      paymentIntentId,
      courseId
    });
  },

  getPaymentHistory: async (page = 1, limit = 10) => {
    return await apiClient.get(`/payments/history?page=${page}&limit=${limit}`);
  },

  processRefund: async (enrollmentId, reason) => {
    return await apiClient.post('/payments/refund', {
      enrollmentId,
      reason
    });
  },

  // User APIs
  getDashboardStats: async () => {
    return await apiClient.get('/users/dashboard');
  },

  getUser: async (id) => {
    return await apiClient.get(`/users/${id}`);
  },

  getUsers: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    return await apiClient.get(`/users?${params.toString()}`);
  },

  updateUserStatus: async (id, isActive) => {
    return await apiClient.put(`/users/${id}/status`, { isActive });
  },

  getPlatformStats: async () => {
    return await apiClient.get('/users/stats/overview');
  },

  // Recommendation APIs
  getRecommendations: async () => {
    return await apiClient.get('/recommendations');
  },

  getSimilarCourses: async (courseId) => {
    return await apiClient.get(`/recommendations/similar/${courseId}`);
  },

  submitRecommendationFeedback: async (courseId, helpful, reason) => {
    return await apiClient.post('/recommendations/feedback', {
      courseId,
      helpful,
      reason
    });
  },

  // ML Prediction APIs
  makePrediction: async (data, modelType = 'loan_prediction', options = {}) => {
    return await apiClient.post('/ml/predict', {
      data,
      modelType,
      options
    });
  },

  makePredictionFromFile: async (file, modelType = 'loan_prediction', options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('modelType', modelType);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    return await apiClient.post('/ml/predict-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  getMLModelInfo: async () => {
    return await apiClient.get('/ml/model-info');
  },

  getPredictionHistory: async (page = 1, limit = 10) => {
    return await apiClient.get(`/ml/predictions/history?page=${page}&limit=${limit}`);
  },

  // Dashboard APIs
  getDashboardStats: async (userType, userId) => {
    return await apiClient.get(`/users/dashboard/${userType}/${userId}`);
  },

  getUserStats: async () => {
    return await apiClient.get('/users/stats');
  }
};

// Error handling utility
export const handleApiError = (error) => {
  console.error('API Error:', error);
  return {
    success: false,
    error: error.message || 'An unexpected error occurred'
  };
};

// Export the axios instance for direct use if needed
export { apiClient };
