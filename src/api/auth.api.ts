import { request } from '../shared/api/httpClient';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

export const authApi = {
  async login(payload: LoginRequest) {
    return request<LoginResponse>({
      path: '/auth/login',
      method: 'POST',
      body: payload,
      requiresAuth: false,
    });
  },
};
