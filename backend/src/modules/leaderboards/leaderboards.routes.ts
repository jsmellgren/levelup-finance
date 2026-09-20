import type { FastifyInstance } from "fastify";
import { LeaderboardsService } from "./leaderboards.service.js";

export default async function leaderboardsRoutes(fastify: FastifyInstance) {
  const service = new LeaderboardsService(fastify.prisma);
  const uid = (request: any) => (request.user as { sub: string }).sub;

  fastify.get("/leaderboards/global", { preHandler: [fastify.authenticate] }, async () => {
    return { leaderboard: await service.global() };
  });

  fastify.get("/leaderboards/friends", { preHandler: [fastify.authenticate] }, async (request) => {
    return { leaderboard: await service.friends(uid(request)) };
  });

  fastify.get("/leaderboards/streaks", { preHandler: [fastify.authenticate] }, async (request) => {
    const { scope } = request.query as { scope?: "friends" | "global" };
    return { leaderboard: await service.streaks(uid(request), scope ?? "friends") };
  });
}
