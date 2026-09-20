import type { PrismaClient } from "@prisma/client";
import { XP_REWARDS, levelForXP } from "../../lib/xp.js";
import { logActivity, notify } from "../../lib/activity.js";
import { AchievementsService } from "../achievements/achievements.service.js";

function estimateCompletionDate(current: number, target: number, monthlyContribution?: number | null): Date | null {
  if (!monthlyContribution || monthlyContribution <= 0) return null;
  const remaining = target - current;
  if (remaining <= 0) return new Date();
  const monthsNeeded = Math.ceil(remaining / monthlyContribution);
  const result = new Date();
  result.setMonth(result.getMonth() + monthsNeeded);
  return result;
}

export class GoalsService {
  private achievements: AchievementsService;

  constructor(private prisma: PrismaClient) {
    this.achievements = new AchievementsService(prisma);
  }

  /** Only the goal's owning-mission user can invite contributors. */
  async invite(ownerUserId: string, goalId: string, inviteeUserId: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, mission: { userId: ownerUserId } },
      include: { mission: true },
    });
    if (!goal) throw Object.assign(new Error("Goal not found"), { statusCode: 404 });
    if (inviteeUserId === ownerUserId) throw Object.assign(new Error("You already own this goal"), { statusCode: 400 });

    await this.prisma.goal.update({ where: { id: goalId }, data: { isShared: true } });

    const contributor = await this.prisma.goalContributor.upsert({
      where: { goalId_userId: { goalId, userId: inviteeUserId } },
      update: {},
      create: { goalId, userId: inviteeUserId },
    });

    await notify(this.prisma, inviteeUserId, "GOAL_MILESTONE", `You were invited to contribute to "${goal.mission.title}"`);
    return contributor;
  }

  private async assertCanContribute(userId: string, goalId: string) {
    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId },
      include: { mission: true, contributors: true },
    });
    if (!goal) throw Object.assign(new Error("Goal not found"), { statusCode: 404 });

    const isOwner = goal.mission.userId === userId;
    const isContributor = goal.contributors.some((c) => c.userId === userId);
    if (!isOwner && !isContributor) {
      throw Object.assign(new Error("You don't have access to this goal"), { statusCode: 403 });
    }
    return goal;
  }

  /** Logs a contribution from any owner OR invited contributor of a (possibly shared) goal. */
  async contribute(userId: string, goalId: string, amount: number, note?: string) {
    const goal = await this.assertCanContribute(userId, goalId);

    const newAmount = Number(goal.currentAmount) + amount;
    const estimatedCompletionDate = estimateCompletionDate(
      newAmount,
      Number(goal.targetAmount),
      goal.monthlyContribution ? Number(goal.monthlyContribution) : null
    );

    const [, updatedGoal] = await this.prisma.$transaction([
      this.prisma.progressEntry.create({
        data: { goalId, contributorId: userId, amount, note },
      }),
      this.prisma.goal.update({
        where: { id: goalId },
        data: { currentAmount: newAmount, estimatedCompletionDate },
      }),
    ]);

    const xpAwarded = goal.mission.type === "DEBT" ? XP_REWARDS.LOG_PAYMENT : XP_REWARDS.LOG_CONTRIBUTION;
    await this.prisma.xPEvent.create({ data: { userId, amount: xpAwarded, reason: `Contributed to "${goal.mission.title}"` } });
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { totalXP: user.totalXP + xpAwarded, level: levelForXP(user.totalXP + xpAwarded) },
    });

    await logActivity(this.prisma, userId, "GOAL_MILESTONE", `contributed to "${goal.mission.title}"`);

    if (newAmount >= Number(goal.targetAmount)) {
      await this.prisma.mission.update({ where: { id: goal.missionId }, data: { status: "COMPLETED" } });
      await logActivity(this.prisma, userId, "GOAL_COMPLETED", `completed the shared goal "${goal.mission.title}" 🎉`);
    }

    return { goal: updatedGoal, user: updatedUser };
  }

  async listContributions(goalId: string) {
    return this.prisma.progressEntry.findMany({
      where: { goalId },
      include: { contributor: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
