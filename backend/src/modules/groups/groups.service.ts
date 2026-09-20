import type { PrismaClient } from "@prisma/client";
import { notify } from "../../lib/activity.js";

export class GroupsService {
  constructor(private prisma: PrismaClient) {}

  async create(userId: string, name: string) {
    return this.prisma.group.create({
      data: {
        name,
        creatorId: userId,
        memberships: { create: { userId, role: "OWNER" } },
      },
      include: { memberships: { include: { user: true } } },
    });
  }

  async listForUser(userId: string) {
    return this.prisma.group.findMany({
      where: { memberships: { some: { userId } } },
      include: { memberships: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async getById(userId: string, groupId: string) {
    const group = await this.prisma.group.findFirst({
      where: { id: groupId, memberships: { some: { userId } } },
      include: { memberships: { include: { user: true } }, challenges: true },
    });
    if (!group) return null;
    return group;
  }

  /** Invites an existing friend (by userId) into the group. */
  async invite(userId: string, groupId: string, inviteeUserId: string) {
    const membership = await this.prisma.groupMembership.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!membership) throw Object.assign(new Error("Not a member of this group"), { statusCode: 403 });

    const existing = await this.prisma.groupMembership.findUnique({
      where: { groupId_userId: { groupId, userId: inviteeUserId } },
    });
    if (existing) throw Object.assign(new Error("Already a member"), { statusCode: 409 });

    const group = await this.prisma.group.findUniqueOrThrow({ where: { id: groupId } });
    const created = await this.prisma.groupMembership.create({
      data: { groupId, userId: inviteeUserId, role: "MEMBER" },
    });

    await notify(this.prisma, inviteeUserId, "GROUP_INVITE", `You were added to the group "${group.name}"`);
    return created;
  }

  /** Progress-based leaderboard: ranks members by XP earned since they joined the group, not raw balances. */
  async leaderboard(groupId: string) {
    const memberships = await this.prisma.groupMembership.findMany({
      where: { groupId },
      include: { user: true },
    });

    const rows = await Promise.all(
      memberships.map(async (m) => {
        const xpSince = await this.prisma.xPEvent.aggregate({
          where: { userId: m.userId, createdAt: { gte: m.joinedAt } },
          _sum: { amount: true },
        });
        return {
          userId: m.userId,
          username: m.user.username,
          name: m.user.name,
          avatarUrl: m.user.avatarUrl,
          xpSinceJoining: xpSince._sum.amount ?? 0,
          currentStreak: m.user.currentStreak,
        };
      })
    );

    return rows.sort((a, b) => b.xpSinceJoining - a.xpSinceJoining);
  }
}
