import type { PrismaClient } from "@prisma/client";
import { MissionsService } from "../missions/missions.service.js";
import { XP_REWARDS } from "../../lib/xp.js";
import { dailyTasksForMission } from "../../lib/tasks.js";

export class TasksService {
  private missions: MissionsService;

  constructor(private prisma: PrismaClient) {
    this.missions = new MissionsService(prisma);
  }

  async listToday(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let tasks = await this.prisma.task.findMany({
      where: { userId, dueDate: { gte: startOfDay, lte: endOfDay } },
      orderBy: { createdAt: "asc" },
    });

    // Nothing generated for today yet — build a fresh set from the user's primary active mission.
    if (tasks.length === 0) {
      const mission = await this.prisma.mission.findFirst({
        where: { userId, status: "ACTIVE", isPrimary: true },
      });

      if (mission) {
        const templates = dailyTasksForMission(mission.type);
        await this.prisma.task.createMany({
          data: templates.map((t) => ({
            userId,
            missionId: mission.id,
            title: t.title,
            xpReward: t.xpReward,
            dueDate: new Date(),
          })),
        });

        tasks = await this.prisma.task.findMany({
          where: { userId, dueDate: { gte: startOfDay, lte: endOfDay } },
          orderBy: { createdAt: "asc" },
        });
      }
    }

    return tasks;
  }

  async updateStatus(userId: string, taskId: string, status: "COMPLETED" | "SKIPPED" | "PENDING") {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) {
      throw Object.assign(new Error("Task not found"), { statusCode: 404 });
    }

    const updated = await this.prisma.task.update({ where: { id: taskId }, data: { status } });

    if (status === "COMPLETED" && task.status !== "COMPLETED") {
      await this.missions.awardXP(userId, task.xpReward || XP_REWARDS.COMPLETE_TASK, `Completed task "${task.title}"`);
      await this.missions.bumpStreak(userId);
    }

    return updated;
  }
}