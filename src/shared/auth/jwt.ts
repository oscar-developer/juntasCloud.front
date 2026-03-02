function decodeBase64Url(value: string): string | null {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = normalized.length % 4;
    const padded = padding === 0 ? normalized : normalized.padEnd(normalized.length + (4 - padding), '=');
    const decoded = atob(padded);
    const bytes = Array.from(decoded, (char) => {
      const hex = char.charCodeAt(0).toString(16).padStart(2, '0');
      return `%${hex}`;
    }).join('');

    return decodeURIComponent(bytes);
  } catch {
    return null;
  }
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const segments = token.split('.');

  if (segments.length < 2) {
    return null;
  }

  const decodedPayload = decodeBase64Url(segments[1]);

  if (!decodedPayload) {
    return null;
  }

  try {
    return JSON.parse(decodedPayload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getUserIdFromToken(token: string | null | undefined): string | null {
  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload(token);

  if (!payload) {
    return null;
  }

  const userId = payload.sub ?? payload.id_user;

  if (typeof userId === 'string' || typeof userId === 'number') {
    return String(userId);
  }

  return null;
}
