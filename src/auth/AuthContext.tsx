import { createContext, useEffect, useState, type PropsWithChildren } from 'react';
import { authApi } from '../api/auth.api';
import { clearToken, getToken, setToken } from '../shared/auth/authStorage';
import type { AuthUser, LoginRequest } from '../types/auth.types';

const USER_STORAGE_KEY = 'juntascloud.user';

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser() {
  const rawUser = localStorage.getItem(USER_STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessToken] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  useEffect(() => {
    if (!accessToken) {
      setUser(null);
      clearToken();
      localStorage.removeItem(USER_STORAGE_KEY);
      return;
    }

    setToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      return;
    }

    localStorage.removeItem(USER_STORAGE_KEY);
  }, [user]);

  const value: AuthContextValue = {
    user,
    accessToken,
    isAuthenticated: Boolean(accessToken),
    async login(credentials) {
      const response = await authApi.login(credentials);
      setAccessToken(response.accessToken);
      setUser(response.user);
    },
    logout() {
      setAccessToken(null);
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
