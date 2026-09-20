import { apiRequest } from "./client";

export type Task = {
  id: string;
  title: string;
  xpReward: number;
  status: "PENDING" | "COMPLETED" | "SKIPPED";
  missionId: string | null;
};

export function listTodayTasks(token: string) {
  return apiRequest<{ tasks: Task[] }>("/tasks/today", token);
}

export function updateTaskStatus(token: string, taskId: string, status: Task["status"]) {
  return apiRequest<{ task: Task }>(`/tasks/${taskId}`, token, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
