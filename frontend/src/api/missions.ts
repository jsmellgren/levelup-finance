import { apiRequest } from "./client";

export type Goal = {
  id: string;
  currentAmount: string;
  targetAmount: string;
  targetDate: string | null;
  estimatedCompletionDate: string | null;
  monthlyContribution: string | null;
  interestRate: string | null;
  progressEntries: { id: string; amount: string; note: string | null; createdAt: string }[];
};

export type Mission = {
  id: string;
  type: "DEBT" | "SAVINGS" | "NET_WORTH" | "CUSTOM";
  title: string;
  isPrimary: boolean;
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  goal: Goal | null;
  tasks?: { id: string; title: string; status: string; xpReward: number }[];
};

export type CreateMissionPayload = {
  type: Mission["type"];
  title: string;
  currentAmount: number;
  targetAmount: number;
  targetDate?: string | null;
  monthlyContribution?: number | null;
  interestRate?: number | null;
};

export function listMissions(token: string) {
  return apiRequest<{ missions: Mission[] }>("/missions", token);
}

export function getMission(token: string, id: string) {
  return apiRequest<{ mission: Mission }>(`/missions/${id}`, token);
}

export function createMission(token: string, payload: CreateMissionPayload) {
  return apiRequest<{ mission: Mission }>("/missions", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logProgress(token: string, missionId: string, amount: number, note?: string) {
  return apiRequest<{
    goal: Goal;
    user: { level: number; totalXP: number };
    unlockedAchievements: { achievement: { title: string; icon: string } }[];
  }>(`/missions/${missionId}/progress`, token, {
    method: "POST",
    body: JSON.stringify({ amount, note }),
  });
}

export function deleteProgressEntry(token: string, missionId: string, entryId: string) {
  return apiRequest<{ goal: Goal }>(`/missions/${missionId}/progress/${entryId}`, token, {
    method: "DELETE",
  });
}