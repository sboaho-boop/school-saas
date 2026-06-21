const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getSuperToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('edu_super_token');
}

function setSuperToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem('edu_super_token', token);
  else localStorage.removeItem('edu_super_token');
}

export function logoutSuper() {
  setSuperToken(null);
  if (typeof window !== 'undefined') window.location.href = '/super-admin/login';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getSuperToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: 'include' });
  if (res.status === 401) { logoutSuper(); throw new Error('Session expired'); }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const superApi = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export { getSuperToken, setSuperToken };
