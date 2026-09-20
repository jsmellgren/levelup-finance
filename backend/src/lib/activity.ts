import type { PrismaClient, ActivityType, NotificationType, Prisma } from "@prisma/client";

export async function logActivity(
  prisma: PrismaClient,
  userId: string,
  type: ActivityType,
  message: string,
  metadata?: Record<string, unknown>
) {
  return prisma.activityEvent.create({
    data: { userId, type, message, metadata: (metadata as Prisma.InputJsonValue) ?? undefined },
  });
}

export async function notify(
  prisma: PrismaClient,
  userId: string,
  type: NotificationType,
  message: string,
  metadata?: Record<string, unknown>
) {
  return prisma.notification.create({
    data: { userId, type, message, metadata: (metadata as Prisma.InputJsonValue) ?? undefined },
  });
}