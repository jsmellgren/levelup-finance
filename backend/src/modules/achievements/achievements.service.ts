import type { PrismaClient } from "@prisma/client";
import { logActivity } from "../../lib/activity.js";

export class AchievementsService {
  constructor(private prisma: PrismaClient) {}

  async listAll() {
    return this.prisma.achievement.findMany({ orderBy: { title: "asc" } });
  }

  async listForUser(userId: string) {
    return this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" },
    });
  }

  /** Unlock an achievement by key if the user doesn't already have it. Safe to call repeatedly. */
  async unlock(userId: string, key: string) {
    const achievement = await this.prisma.achievement.findUnique({ where: { key } });
    if (!achievement) return null;

    const existing = await this.prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId: achievement.id } },
    });
    if (existing) return null;

    const created = await this.prisma.userAchievement.create({
      data: { userId, achievementId: achievement.id },
      include: { achievement: true },
    });

    await logActivity(this.prisma, userId, "ACHIEVEMENT_UNLOCKED", `unlocked the achievement "${achievement.title}" ${achievement.icon}`);

    return created;
  }

  /**
   * Rule-based unlock checks run after a progress log or task completion.
   * Returns any newly-unlocked achievements so the caller can surface them.
   */
  async checkUnlocksAfterProgress(userId: string, opts: {
    missionType: string;
    goalCurrentAmount: number;
    goalTargetAmount: number;
    isFirstProgressEntry: boolean;
  }) {
    const unlocked = [];

    if (opts.missionType === "DEBT" && opts.isFirstProgressEntry) {
      const a = await this.unlock(userId, "first_payment");
      if (a) unlocked.push(a);
    }
    if (opts.missionType === "DEBT" && opts.goalCurrentAmount >= opts.goalTargetAmount) {
      const a1 = await this.unlock(userId, "debt_paid_off");
      const a2 = await this.unlock(userId, "debt_free");
      [a1, a2].forEach((a) => a && unlocked.push(a));
    }
    if (opts.missionType === "SAVINGS") {
      if (opts.goalCurrentAmount >= 500) {
        const a = await this.unlock(userId, "first_500_saved");
        if (a) unlocked.push(a);
      }
      if (opts.goalCurrentAmount >= 1000) {
        const a = await this.unlock(userId, "first_1000_saved");
        if (a) unlocked.push(a);
      }
    }
    if (opts.missionType === "NET_WORTH" && opts.goalCurrentAmount >= 10000) {
      const a = await this.unlock(userId, "net_worth_10k");
      if (a) unlocked.push(a);
    }
    if (opts.goalCurrentAmount >= 100000) {
      const a = await this.unlock(userId, "first_100k");
      if (a) unlocked.push(a);
    }

    return unlocked;
  }

  async checkStreakUnlock(userId: string, currentStreak: number) {
    if (currentStreak >= 30) {
      return this.unlock(userId, "streak_30");
    }
    if (currentStreak >= 7) {
      return this.unlock(userId, "streak_7");
    }
    return null;
  }
}
