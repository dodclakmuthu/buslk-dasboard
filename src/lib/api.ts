export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const COOKIE_SESSION_TOKEN = '__cookie_session__';

function getBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return (base && base.trim().length > 0 ? base.trim() : 'http://localhost:3001').replace(/\/+$/, '');
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const url = `${getBaseUrl()}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (options.token && options.token !== COOKIE_SESSION_TOKEN) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const text = await res.text();
  const data = text ? ((): unknown => {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  })() : undefined;

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && data !== null && 'message' in data && typeof (data as any).message === 'string'
        ? (data as any).message
        : `Request failed (${res.status})`);
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}
