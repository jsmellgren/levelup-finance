import { apiRequest } from "./client";

export type UserAchievement = {
  id: string;
  unlockedAt: string;
  achievement: { key: string; title: string; description: string; icon: string };
};

export function listMyAchievements(token: string) {
  return apiRequest<{ achievements: UserAchievement[] }>("/me/achievements", token);
}
