import type { PrismaClient } from "@prisma/client";
import { notify } from "../../lib/activity.js";
import { AchievementsService } from "../achievements/achievements.service.js";

function publicUser(u: { id: string; username: string | null; name: string | null; avatarUrl: string | null; level: number; totalXP: number; currentStreak: number }) {
  return { id: u.id, username: u.username, name: u.name, avatarUrl: u.avatarUrl, level: u.level, totalXP: u.totalXP, currentStreak: u.currentStreak };
}

export class FriendsService {
  private achievements: AchievementsService;

  constructor(private prisma: PrismaClient) {
    this.achievements = new AchievementsService(prisma);
  }

  async sendRequest(userId: string, targetUsername: string) {
    const target = await this.prisma.user.findUnique({ where: { username: targetUsername } });
    if (!target) throw Object.assign(new Error("No user with that username"), { statusCode: 404 });
    if (target.id === userId) throw Object.assign(new Error("You can't friend yourself"), { statusCode: 400 });

    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userId, recipientId: target.id },
          { requesterId: target.id, recipientId: userId },
        ],
      },
    });
    if (existing) throw Object.assign(new Error("A friend request already exists between you two"), { statusCode: 409 });

    const friendship = await this.prisma.friendship.create({
      data: { requesterId: userId, recipientId: target.id },
    });

    const requester = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    await notify(this.prisma, target.id, "FRIEND_REQUEST", `${requester.username ?? requester.name ?? "Someone"} sent you a friend request`);

    return friendship;
  }

  async respond(userId: string, friendshipId: string, accept: boolean) {
    const friendship = await this.prisma.friendship.findFirst({
      where: { id: friendshipId, recipientId: userId, status: "PENDING" },
    });
    if (!friendship) throw Object.assign(new Error("Friend request not found"), { statusCode: 404 });

    const updated = await this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: accept ? "ACCEPTED" : "DECLINED", respondedAt: new Date() },
    });

    if (accept) {
      const recipient = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
      await notify(this.prisma, friendship.requesterId, "FRIEND_ACCEPTED", `${recipient.username ?? recipient.name ?? "Someone"} accepted your friend request`);
      await this.achievements.unlock(userId, "first_friend");
      await this.achievements.unlock(friendship.requesterId, "first_friend");
    }

    return updated;
  }

  async remove(userId: string, friendshipId: string) {
    const friendship = await this.prisma.friendship.findFirst({
      where: { id: friendshipId, OR: [{ requesterId: userId }, { recipientId: userId }] },
    });
    if (!friendship) throw Object.assign(new Error("Friendship not found"), { statusCode: 404 });
    await this.prisma.friendship.delete({ where: { id: friendshipId } });
  }

  async listFriends(userId: string) {
    const rows = await this.prisma.friendship.findMany({
      where: { status: "ACCEPTED", OR: [{ requesterId: userId }, { recipientId: userId }] },
      include: { requester: true, recipient: true },
    });
    return rows.map((r) => ({
      friendshipId: r.id,
      user: publicUser(r.requesterId === userId ? r.recipient : r.requester),
    }));
  }

  async listPendingReceived(userId: string) {
    const rows = await this.prisma.friendship.findMany({
      where: { status: "PENDING", recipientId: userId },
      include: { requester: true },
    });
    return rows.map((r) => ({ friendshipId: r.id, user: publicUser(r.requester), createdAt: r.createdAt }));
  }

  async listPendingSent(userId: string) {
    const rows = await this.prisma.friendship.findMany({
      where: { status: "PENDING", requesterId: userId },
      include: { recipient: true },
    });
    return rows.map((r) => ({ friendshipId: r.id, user: publicUser(r.recipient), createdAt: r.createdAt }));
  }

  /** Returns just the accepted friend user IDs — used by feed/leaderboard scoping. */
  async friendIds(userId: string): Promise<string[]> {
    const rows = await this.prisma.friendship.findMany({
      where: { status: "ACCEPTED", OR: [{ requesterId: userId }, { recipientId: userId }] },
      select: { requesterId: true, recipientId: true },
    });
    return rows.map((r) => (r.requesterId === userId ? r.recipientId : r.requesterId));
  }
}
