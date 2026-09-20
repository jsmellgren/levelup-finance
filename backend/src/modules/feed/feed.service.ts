import type { PrismaClient } from "@prisma/client";
import { FriendsService } from "../friends/friends.service.js";

export class FeedService {
  private friends: FriendsService;

  constructor(private prisma: PrismaClient) {
    this.friends = new FriendsService(prisma);
  }

  async listForUser(userId: string, limit = 50) {
    const friendIds = await this.friends.friendIds(userId);
    const scope = [userId, ...friendIds];

    return this.prisma.activityEvent.findMany({
      where: { userId: { in: scope } },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}
