import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import prismaPlugin from "./plugins/prisma.js";
import authPlugin from "./plugins/auth.js";
import authRoutes from "./modules/auth/auth.routes.js";
import missionsRoutes from "./modules/missions/missions.routes.js";
import tasksRoutes from "./modules/tasks/tasks.routes.js";
import achievementsRoutes from "./modules/achievements/achievements.routes.js";
import overviewRoutes from "./modules/overview/overview.routes.js";
import coachRoutes from "./modules/coach/coach.routes.js";
import friendsRoutes from "./modules/friends/friends.routes.js";
import groupsRoutes from "./modules/groups/groups.routes.js";
import challengesRoutes from "./modules/challenges/challenges.routes.js";
import goalsRoutes from "./modules/goals/goals.routes.js";
import feedRoutes from "./modules/feed/feed.routes.js";
import notificationsRoutes from "./modules/notifications/notifications.routes.js";
import leaderboardsRoutes from "./modules/leaderboards/leaderboards.routes.js";

const PORT = Number(process.env.PORT ?? 4000);

async function buildServer() {
  const fastify = Fastify({ logger: true });

  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  });

  await fastify.register(prismaPlugin);
  await fastify.register(authPlugin);

  fastify.get("/health", async () => ({ status: "ok" }));

  await fastify.register(authRoutes, { prefix: "/api/v1" });
  await fastify.register(missionsRoutes, { prefix: "/api/v1" });
  await fastify.register(tasksRoutes, { prefix: "/api/v1" });
  await fastify.register(achievementsRoutes, { prefix: "/api/v1" });
  await fastify.register(overviewRoutes, { prefix: "/api/v1" });
  await fastify.register(coachRoutes, { prefix: "/api/v1" });
  await fastify.register(friendsRoutes, { prefix: "/api/v1" });
  await fastify.register(groupsRoutes, { prefix: "/api/v1" });
  await fastify.register(challengesRoutes, { prefix: "/api/v1" });
  await fastify.register(goalsRoutes, { prefix: "/api/v1" });
  await fastify.register(feedRoutes, { prefix: "/api/v1" });
  await fastify.register(notificationsRoutes, { prefix: "/api/v1" });
  await fastify.register(leaderboardsRoutes, { prefix: "/api/v1" });

  return fastify;
}

buildServer()
  .then((fastify) => fastify.listen({ port: PORT, host: "0.0.0.0" }))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
