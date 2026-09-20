import { apiRequest } from "./client";

export function inviteToGoal(token: string, goalId: string, userId: string) {
  return apiRequest<{ contributor: unknown }>(`/goals/${goalId}/invite`, token, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export function contributeToGoal(token: string, goalId: string, amount: number, note?: string) {
  return apiRequest<{ goal: unknown; user: unknown }>(`/goals/${goalId}/contribute`, token, {
    method: "POST",
    body: JSON.stringify({ amount, note }),
  });
}

export type Contribution = {
  id: string;
  amount: string;
  note: string | null;
  createdAt: string;
  contributor: { id: string; username: string | null; name: string | null } | null;
};

export function listContributions(token: string, goalId: string) {
  return apiRequest<{ contributions: Contribution[] }>(`/goals/${goalId}/contributions`, token);
}
