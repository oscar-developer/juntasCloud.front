import { request } from '../shared/api/httpClient';
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
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
  async changePassword(payload: ChangePasswordRequest) {
    return request<ChangePasswordResponse>({
      path: '/auth/change-password',
      method: 'POST',
      body: payload,
    });
  },
  async forgotPassword(payload: ForgotPasswordRequest) {
    return request<ForgotPasswordResponse>({
      path: '/auth/forgot-password',
      method: 'POST',
      body: payload,
      requiresAuth: false,
    });
  },
  async resetPassword(payload: ResetPasswordRequest) {
    return request<ResetPasswordResponse>({
      path: '/auth/reset-password',
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
