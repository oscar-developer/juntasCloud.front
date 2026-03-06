import { request } from '../shared/api/httpClient';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from '../types/auth.types';

export const authApi = {
  async login(payload: LoginRequest) {
    return request<LoginResponse>({
      path: '/auth/login',
      method: 'POST',
      body: payload,
      requiresAuth: false,
    });
  },
  async register(payload: RegisterRequest) {
    return request<RegisterResponse>({
      path: '/auth/register',
      method: 'POST',
      body: payload,
      requiresAuth: false,
    });
  },
  async verifyEmail(payload: VerifyEmailRequest) {
    return request<VerifyEmailResponse>({
      path: '/auth/verify-email',
      method: 'POST',
      body: payload,
      requiresAuth: false,
    });
  },
};
