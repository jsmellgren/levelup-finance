import type { FastifyInstance } from "fastify";
import { AchievementsService } from "./achievements.service.js";

export default async function achievementsRoutes(fastify: FastifyInstance) {
  const service = new AchievementsService(fastify.prisma);

  fastify.get("/achievements", async () => {
    return { achievements: await service.listAll() };
  });

  fastify.get(
    "/me/achievements",
    { preHandler: [fastify.authenticate] },
    async (request) => {
      const userId = (request.user as { sub: string }).sub;
      return { achievements: await service.listForUser(userId) };
    }
  );
}
