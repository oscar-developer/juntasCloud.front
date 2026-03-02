const TOKEN_STORAGE_KEY = 'accessToken';
const LEGACY_TOKEN_STORAGE_KEY = 'juntascloud.accessToken';

export function getToken(): string | null {
  const currentToken = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (currentToken) {
    return currentToken;
  }

  return localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
}

export { LEGACY_TOKEN_STORAGE_KEY, TOKEN_STORAGE_KEY };
