import { apiClient } from './axios';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

export const authApi = {
  async login(payload: LoginRequest) {
    const response = await apiClient.post<LoginResponse>('/auth/login', payload);
    return response.data;
  },
};
