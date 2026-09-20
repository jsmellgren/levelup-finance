import type { FastifyInstance } from "fastify";

export default async function notificationsRoutes(fastify: FastifyInstance) {
  fastify.get("/notifications", { preHandler: [fastify.authenticate] }, async (request) => {
    const userId = (request.user as { sub: string }).sub;
    const notifications = await fastify.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const unreadCount = await fastify.prisma.notification.count({ where: { userId, isRead: false } });
    return { notifications, unreadCount };
  });

  fastify.post("/notifications/:id/read", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const { id } = request.params as { id: string };
    const notification = await fastify.prisma.notification.findFirst({ where: { id, userId } });
    if (!notification) return reply.status(404).send({ error: "Notification not found" });
    const updated = await fastify.prisma.notification.update({ where: { id }, data: { isRead: true } });
    return { notification: updated };
  });

  fastify.post("/notifications/read-all", { preHandler: [fastify.authenticate] }, async (request) => {
    const userId = (request.user as { sub: string }).sub;
    await fastify.prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
    return { success: true };
  });
}
