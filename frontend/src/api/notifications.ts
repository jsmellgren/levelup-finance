import { apiRequest } from "./client";

export type Notification = {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export function getNotifications(token: string) {
  return apiRequest<{ notifications: Notification[]; unreadCount: number }>("/notifications", token);
}

export function markNotificationRead(token: string, id: string) {
  return apiRequest<{ notification: Notification }>(`/notifications/${id}/read`, token, { method: "POST" });
}

export function markAllNotificationsRead(token: string) {
  return apiRequest<{ success: boolean }>("/notifications/read-all", token, { method: "POST" });
}
