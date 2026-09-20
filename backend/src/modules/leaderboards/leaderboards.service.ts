import type { PrismaClient } from "@prisma/client";
import { FriendsService } from "../friends/friends.service.js";

// Leaderboards rank by *behavior* (XP earned in the window, streak length) rather than
// raw account balances, per product principle: don't let the richest person auto-win.
export class LeaderboardsService {
  private friendsService: FriendsService;

  constructor(private prisma: PrismaClient) {
    this.friendsService = new FriendsService(prisma);
  }

  private async xpLeaderboard(userIds: string[] | null, sinceDays: number) {
    const since = new Date();
    since.setDate(since.getDate() - sinceDays);

    const events = await this.prisma.xPEvent.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: since }, ...(userIds ? { userId: { in: userIds } } : {}) },
      _sum: { amount: true },
    });

    const ranked = events
      .map((e) => ({ userId: e.userId, xp: e._sum.amount ?? 0 }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 50);

    const users = await this.prisma.user.findMany({
      where: { id: { in: ranked.map((r) => r.userId) } },
      select: { id: true, username: true, name: true, avatarUrl: true, level: true, currentStreak: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    return ranked
      .map((r) => ({ ...userMap.get(r.userId), xpInPeriod: r.xp }))
      .filter((r) => r.id);
  }

  async global(sinceDays = 7) {
    return this.xpLeaderboard(null, sinceDays);
  }

  async friends(userId: string, sinceDays = 7) {
    const ids = await this.friendsService.friendIds(userId);
    return this.xpLeaderboard([...ids, userId], sinceDays);
  }

  async streaks(userId: string, scope: "friends" | "global" = "friends") {
    const ids = scope === "friends" ? [...(await this.friendsService.friendIds(userId)), userId] : undefined;
    const users = await this.prisma.user.findMany({
      where: ids ? { id: { in: ids } } : {},
      select: { id: true, username: true, name: true, avatarUrl: true, currentStreak: true, longestStreak: true },
      orderBy: { currentStreak: "desc" },
      take: 50,
    });
    return users;
  }
}