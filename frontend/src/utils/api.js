import axios from 'axios';

// Create function to dynamically determine API URL
const getApiUrl = () => {
  // In Docker, use the service name
  if (process.env.NODE_ENV === 'production') {
    return 'http://backend:5000';
  }
  // In development, use localhost
  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

// Create an axios instance
const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000 // 10 second timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add /api prefix if not already present
    if (!config.url.startsWith('/api')) {
      config.url = `/api${config.url}`;
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request for debugging
    console.log('Making request to:', config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful response for debugging
    console.log('Response received:', response.status);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      // Check if the server is reachable
      try {
        const healthCheckUrl = `${getApiUrl()}/api/health`;
        console.log('Checking server health at:', healthCheckUrl);
        await axios.get(healthCheckUrl);
        return Promise.reject(new Error('Request failed. Please try again.'));
      } catch (healthCheckError) {
        console.error('Health check failed:', healthCheckError);
        return Promise.reject(new Error('Unable to connect to server. Please check if the server is running.'));
      }
    }

    // Handle token refresh
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${getApiUrl()}/api/users/refresh-token`, {
          refreshToken
        });

        const { token } = response.data;
        localStorage.setItem('token', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message;
    console.error('API error:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

export default api; 