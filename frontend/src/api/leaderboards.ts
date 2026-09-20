import { apiRequest } from "./client";

export type LeaderboardRow = {
  id: string;
  username: string | null;
  name: string | null;
  avatarUrl: string | null;
  level: number;
  currentStreak: number;
  xpInPeriod: number;
};

export type StreakRow = {
  id: string;
  username: string | null;
  name: string | null;
  avatarUrl: string | null;
  currentStreak: number;
  longestStreak: number;
};

export function getGlobalLeaderboard(token: string) {
  return apiRequest<{ leaderboard: LeaderboardRow[] }>("/leaderboards/global", token);
}

export function getFriendsLeaderboard(token: string) {
  return apiRequest<{ leaderboard: LeaderboardRow[] }>("/leaderboards/friends", token);
}

export function getStreakLeaderboard(token: string, scope: "friends" | "global" = "friends") {
  return apiRequest<{ leaderboard: StreakRow[] }>(`/leaderboards/streaks?scope=${scope}`, token);
}
