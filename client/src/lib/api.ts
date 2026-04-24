import axios from 'axios';
import { API_CONFIG } from './config';

// Using centralized configuration
const baseURL = API_CONFIG.BASE_URL;

// Create axios instance with interceptors for debugging
const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(request => {
  console.log('API Request:', {
    url: request.url,
    method: request.method,
    data: request.data,
    headers: request.headers,
    withCredentials: request.withCredentials
  });
  return request;
});

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
  response => {
    console.log('API Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  error => {
    console.error('API Error:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : null
    });
    return Promise.reject(error);
  }
);

export const api = {
  async get<T>(path: string): Promise<T> {
    const response = await axiosInstance.get<T>(path, { withCredentials: true });
    return response.data;
  },

  async post<T>(path: string, data?: any): Promise<T> {
    const response = await axiosInstance.post<T>(path, data, { withCredentials: true });
    return response.data;
  },

  async put<T>(path: string, data?: any): Promise<T> {
    const response = await axiosInstance.put<T>(path, data, { withCredentials: true });
    return response.data;
  },

  async delete<T>(path: string): Promise<T> {
    const response = await axiosInstance.delete<T>(path, { withCredentials: true });
    return response.data;
  },
};
