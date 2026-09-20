import type { PrismaClient } from "@prisma/client";
import type { CreateMissionInput, LogProgressInput } from "./missions.schema.js";
import { defaultTasksForMission } from "../../lib/tasks.js";
import { levelForXP, XP_REWARDS } from "../../lib/xp.js";
import { AchievementsService } from "../achievements/achievements.service.js";
import { logActivity } from "../../lib/activity.js";

function estimateCompletionDate(current: number, target: number, monthlyContribution?: number | null): Date | null {
  if (!monthlyContribution || monthlyContribution <= 0) return null;
  const remaining = target - current;
  if (remaining <= 0) return new Date();
  const monthsNeeded = Math.ceil(remaining / monthlyContribution);
  const result = new Date();
  result.setMonth(result.getMonth() + monthsNeeded);
  return result;
}

export class MissionsService {
  private achievements: AchievementsService;

  constructor(private prisma: PrismaClient) {
    this.achievements = new AchievementsService(prisma);
  }

  async listForUser(userId: string) {
    return this.prisma.mission.findMany({
      where: { userId },
      include: { goal: { include: { progressEntries: { orderBy: { createdAt: "desc" }, take: 10 } } } },
      orderBy: { createdAt: "asc" },
    });
  }

  async getById(userId: string, missionId: string) {
    return this.prisma.mission.findFirst({
      where: { id: missionId, userId },
      include: {
        goal: { include: { progressEntries: { orderBy: { createdAt: "desc" } } } },
        tasks: { orderBy: { dueDate: "asc" } },
      },
    });
  }

  /** Creates a mission + goal, generates today's default tasks, marks the user onboarded. */
  async create(userId: string, input: CreateMissionInput) {
    const existingCount = await this.prisma.mission.count({ where: { userId } });
    const isPrimary = existingCount === 0;

    const estimatedCompletionDate = estimateCompletionDate(
      input.currentAmount,
      input.targetAmount,
      input.monthlyContribution
    );

    const mission = await this.prisma.mission.create({
      data: {
        userId,
        type: input.type,
        title: input.title,
        isPrimary,
        goal: {
          create: {
            currentAmount: input.currentAmount,
            targetAmount: input.targetAmount,
            targetDate: input.targetDate ? new Date(input.targetDate) : null,
            monthlyContribution: input.monthlyContribution ?? null,
            interestRate: input.interestRate ?? null,
            estimatedCompletionDate,
          },
        },
      },
      include: { goal: true },
    });

    const templates = defaultTasksForMission(input.type);
    await this.prisma.task.createMany({
      data: templates.map((t) => ({
        userId,
        missionId: mission.id,
        title: t.title,
        xpReward: t.xpReward,
      })),
    });

    if (isPrimary) {
      await this.prisma.user.update({ where: { id: userId }, data: { onboarded: true } });
    }

    return mission;
  }

  /** Logs a payment/contribution against a goal, awards XP, updates streak, checks achievements. */
  async logProgress(userId: string, missionId: string, input: LogProgressInput) {
    const mission = await this.prisma.mission.findFirst({
      where: { id: missionId, userId },
      include: { goal: true },
    });
    if (!mission || !mission.goal) {
      throw Object.assign(new Error("Mission not found"), { statusCode: 404 });
    }

    const isFirstProgressEntry = (await this.prisma.progressEntry.count({ where: { goalId: mission.goal.id } })) === 0;

    const newAmount = Number(mission.goal.currentAmount) + input.amount;
    const estimatedCompletionDate = estimateCompletionDate(
      newAmount,
      Number(mission.goal.targetAmount),
      mission.goal.monthlyContribution ? Number(mission.goal.monthlyContribution) : null
    );

    const [, updatedGoal] = await this.prisma.$transaction([
      this.prisma.progressEntry.create({
        data: { goalId: mission.goal.id, amount: input.amount, note: input.note },
      }),
      this.prisma.goal.update({
        where: { id: mission.goal.id },
        data: { currentAmount: newAmount, estimatedCompletionDate },
      }),
    ]);

    const xpAwarded = mission.type === "DEBT" ? XP_REWARDS.LOG_PAYMENT : XP_REWARDS.LOG_CONTRIBUTION;
    const { user } = await this.awardXP(userId, xpAwarded, `Logged progress on "${mission.title}"`);
    await this.bumpStreak(userId);

    const unlocked = await this.achievements.checkUnlocksAfterProgress(userId, {
      missionType: mission.type,
      goalCurrentAmount: newAmount,
      goalTargetAmount: Number(mission.goal.targetAmount),
      isFirstProgressEntry,
    });

    if (newAmount >= Number(mission.goal.targetAmount)) {
      await this.prisma.mission.update({ where: { id: mission.id }, data: { status: "COMPLETED" } });
      await this.awardXP(userId, XP_REWARDS.REACH_MILESTONE, `Completed mission "${mission.title}"`);
      await logActivity(this.prisma, userId, "GOAL_COMPLETED", `completed the mission "${mission.title}" 🎉`);
    } else {
      const percent = (newAmount / Number(mission.goal.targetAmount)) * 100;
      const priorPercent = (Number(mission.goal.currentAmount) / Number(mission.goal.targetAmount)) * 100;
      // Fire a feed event the first time progress crosses a 25/50/75% milestone.
      for (const threshold of [25, 50, 75]) {
        if (priorPercent < threshold && percent >= threshold) {
          await logActivity(this.prisma, userId, "GOAL_MILESTONE", `is ${threshold}% of the way to "${mission.title}"`);
        }
      }
    }

    return { goal: updatedGoal, user, unlockedAchievements: unlocked };
  }

  /** Deletes a logged payment/contribution and reverses its effect on the goal's current amount. */
  async deleteProgressEntry(userId: string, missionId: string, entryId: string) {
    const mission = await this.prisma.mission.findFirst({
      where: { id: missionId, userId },
      include: { goal: true },
    });
    if (!mission || !mission.goal) {
      throw Object.assign(new Error("Mission not found"), { statusCode: 404 });
    }

    const entry = await this.prisma.progressEntry.findFirst({
      where: { id: entryId, goalId: mission.goal.id },
    });
    if (!entry) {
      throw Object.assign(new Error("Activity entry not found"), { statusCode: 404 });
    }

    const newAmount = Math.max(0, Number(mission.goal.currentAmount) - Number(entry.amount));
    const estimatedCompletionDate = estimateCompletionDate(
      newAmount,
      Number(mission.goal.targetAmount),
      mission.goal.monthlyContribution ? Number(mission.goal.monthlyContribution) : null
    );

    const [, updatedGoal] = await this.prisma.$transaction([
      this.prisma.progressEntry.delete({ where: { id: entryId } }),
      this.prisma.goal.update({
        where: { id: mission.goal.id },
        data: { currentAmount: newAmount, estimatedCompletionDate },
      }),
    ]);

    // If deleting this entry drops the goal back below its target, un-complete the mission.
    if (mission.status === "COMPLETED" && newAmount < Number(mission.goal.targetAmount)) {
      await this.prisma.mission.update({ where: { id: mission.id }, data: { status: "ACTIVE" } });
    }

    return { goal: updatedGoal };
  }

  async awardXP(userId: string, amount: number, reason: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const newTotal = user.totalXP + amount;
    const newLevel = levelForXP(newTotal);

    await     await this.prisma.xPEvent.create({ data: { userId, amount, reason } });
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { totalXP: newTotal, level: newLevel },
    });

    const leveledUp = newLevel > user.level;
    if (leveledUp) {
      await logActivity(this.prisma, userId, "LEVEL_UP", `reached Level ${newLevel} 🎮`);
    }

    return { user: updatedUser, leveledUp };
  }

  async bumpStreak(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const now = new Date();
    const last = user.lastActivityAt;

    let newStreak = 1;
    if (last) {
      const hoursSince = (now.getTime() - last.getTime()) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        newStreak = user.currentStreak; // already logged today, no change
      } else if (hoursSince < 48) {
        newStreak = user.currentStreak + 1; // consecutive day
      } else {
        newStreak = 1; // streak broken
      }
    }

    const newLongest = Math.max(user.longestStreak, newStreak);
    await this.prisma.user.update({
      where: { id: userId },
      data: { currentStreak: newStreak, longestStreak: newLongest, lastActivityAt: now },
    });

    if (newStreak > 0 && newStreak !== user.currentStreak && [7, 14, 30, 60, 100].includes(newStreak)) {
      await logActivity(this.prisma, userId, "STREAK_MILESTONE", `hit a ${newStreak}-day streak 🔥`);
    }

    await this.achievements.checkStreakUnlock(userId, newStreak);
  }
}