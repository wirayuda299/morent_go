import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.response.use(
  response => {
    if (response.data && response.data.success === false) {
      return Promise.reject({
        message: response.data.message || 'An error occurred.',
        success: response.data.success,
        data: response.data.data,
      });
    }
    return response.data;
  },
  error => {
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage =
        data?.message || `HTTP Error ${status}: ${error.message}`;
      return Promise.reject({
        message: errorMessage,
        status,
        originalError: error,
      });
    }
    return Promise.reject({
      message: 'Network error or no response received.',
      originalError: error,
    });
  },
);

// Export a type for the API responses
export type ApiResponse<T = any> = {
  data: T;
  success: boolean;
  message?: string;
};
