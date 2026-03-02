import { clearToken, getToken } from '../auth/authStorage';
import { navigateToLogin } from '../auth/navigation';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestOptions = {
  path: string;
  method: HttpMethod;
  body?: unknown;
  signal?: AbortSignal;
};

type ErrorResponse = {
  error?: string;
  message?: string;
};

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

function getBaseUrl(): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (!baseUrl) {
    console.error('Missing VITE_API_BASE_URL environment variable');
    throw new Error('Missing VITE_API_BASE_URL environment variable');
  }

  return baseUrl;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';

  if (!contentType.includes('application/json')) {
    return undefined;
  }

  const text = await response.text();

  if (!text) {
    return undefined;
  }

  return JSON.parse(text) as unknown;
}

function getErrorMessage(status: number, data: unknown): string {
  if (data && typeof data === 'object') {
    const candidate = data as ErrorResponse;

    if (typeof candidate.message === 'string' && candidate.message.trim()) {
      return candidate.message;
    }

    if (typeof candidate.error === 'string' && candidate.error.trim()) {
      return candidate.error;
    }
  }

  return `Request failed with status ${status}`;
}

export async function request<T>({ path, method, body, signal }: RequestOptions): Promise<T> {
  const token = getToken();
  const headers = new Headers({
    Accept: 'application/json',
  });

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  const data = await parseResponseBody(response);

  if (response.status === 401) {
    clearToken();
    navigateToLogin();
    throw new HttpError(getErrorMessage(response.status, data), response.status, data);
  }

  if (!response.ok) {
    throw new HttpError(getErrorMessage(response.status, data), response.status, data);
  }

  return data as T;
}

export type { HttpMethod, RequestOptions };
