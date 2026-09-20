import { apiRequest } from "./client";

export type ChallengeType = "SAVINGS" | "DEBT" | "SPENDING" | "HABIT";
export type ChallengeVisibility = "PRIVATE" | "GROUP" | "PUBLIC";

export type ChallengeParticipant = {
  id: string;
  userId: string;
  currentAmount: string;
  joinedAt: string;
  completedAt: string | null;
  user?: { id: string; username: string | null; name: string | null; avatarUrl: string | null };
};

export type Challenge = {
  id: string;
  creatorId: string;
  groupId: string | null;
  type: ChallengeType;
  title: string;
  description: string | null;
  targetAmount: string | null;
  durationDays: number;
  startDate: string;
  endDate: string;
  visibility: ChallengeVisibility;
  shareSlug: string | null;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  participants: ChallengeParticipant[];
  creator?: { id: string; username: string | null; name: string | null };
};

export type CreateChallengePayload = {
  type: ChallengeType;
  title: string;
  description?: string;
  targetAmount?: number;
  durationDays: number;
  visibility: ChallengeVisibility;
  groupId?: string;
  inviteeUserIds?: string[];
};

export function listMyChallenges(token: string) {
  return apiRequest<{ challenges: Challenge[] }>("/challenges", token);
}

export function listPublicChallenges(token: string) {
  return apiRequest<{ challenges: Challenge[] }>("/challenges?scope=public", token);
}

export function createChallenge(token: string, payload: CreateChallengePayload) {
  return apiRequest<{ challenge: Challenge }>("/challenges", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getChallenge(token: string, id: string) {
  return apiRequest<{ challenge: Challenge }>(`/challenges/${id}`, token);
}

export function joinChallenge(token: string, id: string) {
  return apiRequest<{ participant: ChallengeParticipant }>(`/challenges/${id}/join`, token, { method: "POST" });
}

export function joinChallengeByLink(token: string, shareSlug: string) {
  return apiRequest<{ participant: ChallengeParticipant }>(`/challenges/join/${shareSlug}`, token, { method: "POST" });
}

export function logChallengeProgress(token: string, id: string, amount: number) {
  return apiRequest<{ participant: ChallengeParticipant; justCompleted: boolean }>(`/challenges/${id}/progress`, token, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}
export type ChallengeTemplate = {
  key: string;
  title: string;
  description: string;
  type: ChallengeType;
  targetAmount?: number;
  durationDays: number;
  icon: string;
};

export function getChallengeTemplates(token: string) {
  return apiRequest<{ templates: ChallengeTemplate[] }>("/challenges/templates", token);
}