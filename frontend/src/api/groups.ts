import { apiRequest } from "./client";

export type GroupMembership = {
  id: string;
  userId: string;
  role: "OWNER" | "MEMBER";
  user?: { id: string; username: string | null; name: string | null; avatarUrl: string | null };
};

export type Group = {
  id: string;
  name: string;
  creatorId: string;
  createdAt: string;
  memberships: GroupMembership[];
  challenges?: unknown[];
};

export type GroupLeaderboardRow = {
  userId: string;
  username: string | null;
  name: string | null;
  avatarUrl: string | null;
  xpSinceJoining: number;
  currentStreak: number;
};

export function listGroups(token: string) {
  return apiRequest<{ groups: Group[] }>("/groups", token);
}

export function createGroup(token: string, name: string) {
  return apiRequest<{ group: Group }>("/groups", token, { method: "POST", body: JSON.stringify({ name }) });
}

export function getGroup(token: string, id: string) {
  return apiRequest<{ group: Group }>(`/groups/${id}`, token);
}

export function getGroupLeaderboard(token: string, id: string) {
  return apiRequest<{ leaderboard: GroupLeaderboardRow[] }>(`/groups/${id}/leaderboard`, token);
}

export function inviteToGroup(token: string, groupId: string, userId: string) {
  return apiRequest<{ membership: GroupMembership }>(`/groups/${groupId}/invite`, token, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}
