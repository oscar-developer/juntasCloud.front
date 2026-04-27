import axios from 'axios';
import { env } from '../config/env';
import { clearToken, getToken } from '../shared/auth/authStorage';
import { navigateToLogin } from '../shared/auth/navigation';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearToken();
      navigateToLogin();
    }

    return Promise.reject(error);
  },
);
