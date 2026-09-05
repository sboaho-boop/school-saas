const DRIVER_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getDriverToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('edu_driver_token');
}

function setDriverToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem('edu_driver_token', token);
  else localStorage.removeItem('edu_driver_token');
}

async function driverRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getDriverToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${DRIVER_API_URL}${path}`, { ...options, headers, credentials: 'include' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const driverApi = {
  get: <T>(path: string) => driverRequest<T>(path),
  post: <T>(path: string, body?: unknown) => driverRequest<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) => driverRequest<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
};

export { getDriverToken, setDriverToken, DRIVER_API_URL };