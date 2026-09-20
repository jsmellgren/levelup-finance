import type { PrismaClient } from "@prisma/client";
import { randomBytes } from "node:crypto";
import type { CreateChallengeInput } from "./challenges.schema.js";
import { XP_REWARDS, levelForXP } from "../../lib/xp.js";
import { logActivity, notify } from "../../lib/activity.js";
import { AchievementsService } from "../achievements/achievements.service.js";

function makeShareSlug() {
  return randomBytes(4).toString("hex");
}

export class ChallengesService {
  private achievements: AchievementsService;

  constructor(private prisma: PrismaClient) {
    this.achievements = new AchievementsService(prisma);
  }

  async create(userId: string, input: CreateChallengeInput) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + input.durationDays);

    const challenge = await this.prisma.challenge.create({
      data: {
        creatorId: userId,
        groupId: input.groupId ?? null,
        type: input.type,
        title: input.title,
        description: input.description,
        targetAmount: input.targetAmount ?? null,
        durationDays: input.durationDays,
        endDate,
        visibility: input.visibility,
        shareSlug: input.visibility === "PUBLIC" ? makeShareSlug() : null,
        participants: { create: { userId } },
      },
      include: { participants: true },
    });

    // Group challenges auto-include the whole group; friend challenges invite specific users.
    if (input.visibility === "GROUP" && input.groupId) {
      const members = await this.prisma.groupMembership.findMany({ where: { groupId: input.groupId } });
      await this.prisma.challengeParticipant.createMany({
        data: members.filter((m) => m.userId !== userId).map((m) => ({ challengeId: challenge.id, userId: m.userId })),
        skipDuplicates: true,
      });
    } else if (input.visibility === "PRIVATE" && input.inviteeUserIds?.length) {
      await this.prisma.challengeParticipant.createMany({
        data: input.inviteeUserIds.filter((id) => id !== userId).map((id) => ({ challengeId: challenge.id, userId: id })),
        skipDuplicates: true,
      });
      for (const inviteeId of input.inviteeUserIds) {
        if (inviteeId === userId) continue;
        await notify(this.prisma, inviteeId, "CHALLENGE_INVITE", `You were invited to the challenge "${challenge.title}"`);
      }
    }

    await logActivity(this.prisma, userId, "CHALLENGE_JOINED", `started the challenge "${challenge.title}"`);

    return challenge;
  }

  async join(userId: string, challengeId: string) {
    const challenge = await this.prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) throw Object.assign(new Error("Challenge not found"), { statusCode: 404 });
    if (challenge.visibility === "PRIVATE") {
      throw Object.assign(new Error("This challenge is invite-only"), { statusCode: 403 });
    }

    const participant = await this.prisma.challengeParticipant.upsert({
      where: { challengeId_userId: { challengeId, userId } },
      update: {},
      create: { challengeId, userId },
    });

    await logActivity(this.prisma, userId, "CHALLENGE_JOINED", `joined the challenge "${challenge.title}"`);
    return participant;
  }

  async joinByShareSlug(userId: string, shareSlug: string) {
    const challenge = await this.prisma.challenge.findUnique({ where: { shareSlug } });
    if (!challenge) throw Object.assign(new Error("Challenge link is invalid or expired"), { statusCode: 404 });
    return this.join(userId, challenge.id);
  }

  async listMine(userId: string) {
    return this.prisma.challenge.findMany({
      where: { participants: { some: { userId } } },
      include: { participants: true, creator: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async listPublic() {
    return this.prisma.challenge.findMany({
      where: { visibility: "PUBLIC", status: "ACTIVE" },
      include: { participants: true, creator: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async getById(userId: string, challengeId: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        creator: true,
        participants: { include: { user: true }, orderBy: { currentAmount: "desc" } },
      },
    });
    if (!challenge) return null;
    // Private challenges are only visible to participants.
    if (challenge.visibility === "PRIVATE" && !challenge.participants.some((p) => p.userId === userId)) {
      return null;
    }
    return challenge;
  }

  /** Logs progress for one participant, checks first-to-goal win + duration expiry. */
  async logProgress(userId: string, challengeId: string, amount: number) {
    const participant = await this.prisma.challengeParticipant.findUnique({
      where: { challengeId_userId: { challengeId, userId } },
      include: { challenge: true },
    });
    if (!participant) throw Object.assign(new Error("You're not part of this challenge"), { statusCode: 404 });
    if (participant.challenge.status !== "ACTIVE") {
      throw Object.assign(new Error("This challenge has ended"), { statusCode: 400 });
    }

    const newAmount = Number(participant.currentAmount) + amount;
    const target = participant.challenge.targetAmount ? Number(participant.challenge.targetAmount) : null;
    const alreadyCompleted = !!participant.completedAt;
    const justCompleted = !alreadyCompleted && target !== null && newAmount >= target;

    const updated = await this.prisma.challengeParticipant.update({
      where: { id: participant.id },
      data: { currentAmount: newAmount, completedAt: justCompleted ? new Date() : participant.completedAt },
    });

    const { user } = await this.awardXP(userId, XP_REWARDS.CHALLENGE_PROGRESS, `Progress on "${participant.challenge.title}"`);

    if (justCompleted) {
      // Is this the first participant to finish? If so, they're the "winner" of a competitive challenge.
      const priorWinners = await this.prisma.challengeParticipant.count({
        where: { challengeId, completedAt: { not: null }, id: { not: participant.id } },
      });
      const isFirstWinner = priorWinners === 0;

      await logActivity(
        this.prisma,
        userId,
        isFirstWinner ? "CHALLENGE_WON" : "CHALLENGE_COMPLETED",
        isFirstWinner
          ? `won the challenge "${participant.challenge.title}" 🏆`
          : `completed the challenge "${participant.challenge.title}"`
      );

      if (isFirstWinner) {
        await this.awardXP(userId, XP_REWARDS.CHALLENGE_WIN_BONUS, `Won "${participant.challenge.title}"`);
        await this.achievements.unlock(userId, "challenge_champion");
      }
      await this.achievements.unlock(userId, "first_challenge_completed");
    }

    return { participant: updated, user, justCompleted };
  }

  private async awardXP(userId: string, amount: number, reason: string) {
    await this.prisma.xPEvent.create({ data: { userId, amount, reason } });
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const newTotal = user.totalXP + amount;
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { totalXP: newTotal, level: levelForXP(newTotal) },
    });
    return { user: updated };
  }
}
