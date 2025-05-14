import axios from 'axios';

const api = axios.create({
  baseURL: '',  // Remove /api since it's handled by the Vite proxy
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`Making request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with a status code outside of 2xx
      console.error('Response error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', {
        request: error.request,
        config: error.config,
      });
    } else {
      // Something else happened while setting up the request
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 