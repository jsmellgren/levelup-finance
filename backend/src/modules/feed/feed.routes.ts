import type { FastifyInstance } from "fastify";
import { FeedService } from "./feed.service.js";

export default async function feedRoutes(fastify: FastifyInstance) {
  const service = new FeedService(fastify.prisma);

  fastify.get("/feed", { preHandler: [fastify.authenticate] }, async (request) => {
    const userId = (request.user as { sub: string }).sub;
    return { events: await service.listForUser(userId) };
  });
}
