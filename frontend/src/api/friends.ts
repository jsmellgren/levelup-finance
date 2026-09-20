import { apiRequest } from "./client";

export type FriendUser = {
  id: string;
  username: string | null;
  name: string | null;
  avatarUrl: string | null;
  level: number;
  totalXP: number;
  currentStreak: number;
};

export type FriendRow = { friendshipId: string; user: FriendUser };
export type PendingRow = { friendshipId: string; user: FriendUser; createdAt: string };

export function listFriends(token: string) {
  return apiRequest<{ friends: FriendRow[] }>("/friends", token);
}

export function listFriendRequests(token: string) {
  return apiRequest<{ received: PendingRow[]; sent: PendingRow[] }>("/friends/requests", token);
}

export function sendFriendRequest(token: string, username: string) {
  return apiRequest<{ friendship: unknown }>("/friends/requests", token, {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

export function acceptFriendRequest(token: string, friendshipId: string) {
  return apiRequest<{ friendship: unknown }>(`/friends/requests/${friendshipId}/accept`, token, { method: "POST" });
}

export function declineFriendRequest(token: string, friendshipId: string) {
  return apiRequest<{ friendship: unknown }>(`/friends/requests/${friendshipId}/decline`, token, { method: "POST" });
}

export function removeFriend(token: string, friendshipId: string) {
  return apiRequest<void>(`/friends/${friendshipId}`, token, { method: "DELETE" });
}
