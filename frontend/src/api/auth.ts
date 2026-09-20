const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";

export type PublicUser = {
  id: string;
  email: string;
  username: string | null;
  avatarUrl: string | null;
  name: string | null;
  onboarded: boolean;
  level: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
};

type AuthResponse = { token: string; user: PublicUser };

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error ?? "Request failed");
  }

  return data as T;
}

export function register(email: string, password: string, name?: string, username?: string) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name, username }),
  });
}

export function login(email: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function fetchMe(token: string) {
  return request<{ user: PublicUser }>("/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateProfile(token: string, payload: { username?: string; name?: string; avatarUrl?: string }) {
  return request<{ user: PublicUser }>("/me", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export type UserSearchResult = { id: string; username: string | null; name: string | null; avatarUrl: string | null; level: number };

export function searchUsers(token: string, query: string) {
  return request<{ users: UserSearchResult[] }>(`/users/search?q=${encodeURIComponent(query)}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function requestPasswordReset(email: string) {
  return request<{ success: boolean }>("/auth/request-password-reset", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token: string, newPassword: string) {
  return request<{ success: boolean }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}