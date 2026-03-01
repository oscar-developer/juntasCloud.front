export interface AuthUser {
  id: number;
  email: string;
  nombres: string;
  apellidos: string;
  emailVerified: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
