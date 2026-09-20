const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";

export async function apiRequest<T>(path: string, token: string | null, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error ?? "Request failed");
  }
  return data as T;
}