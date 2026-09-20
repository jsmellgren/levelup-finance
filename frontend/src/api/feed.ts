import { apiRequest } from "./client";

export type ActivityEvent = {
  id: string;
  userId: string;
  type: string;
  message: string;
  createdAt: string;
  user: { id: string; username: string | null; name: string | null; avatarUrl: string | null };
};

export function getFeed(token: string) {
  return apiRequest<{ events: ActivityEvent[] }>("/feed", token);
}
