import type { FastifyInstance } from "fastify";
import { createMissionSchema, logProgressSchema } from "./missions.schema.js";
import { MissionsService } from "./missions.service.js";

export default async function missionsRoutes(fastify: FastifyInstance) {
  const service = new MissionsService(fastify.prisma);

  fastify.get("/missions", { preHandler: [fastify.authenticate] }, async (request) => {
    const userId = (request.user as { sub: string }).sub;
    return { missions: await service.listForUser(userId) };
  });

  fastify.get("/missions/:id", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const { id } = request.params as { id: string };
    const mission = await service.getById(userId, id);
    if (!mission) return reply.status(404).send({ error: "Mission not found" });
    return { mission };
  });

  fastify.post("/missions", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const parsed = createMissionSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "ValidationError", details: parsed.error.flatten() });
    }
    const mission = await service.create(userId, parsed.data);
    return reply.status(201).send({ mission });
  });

  fastify.post("/missions/:id/progress", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const { id } = request.params as { id: string };
    const parsed = logProgressSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "ValidationError", details: parsed.error.flatten() });
    }
    try {
      const result = await service.logProgress(userId, id, parsed.data);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(err.statusCode ?? 500).send({ error: err.message ?? "Failed to log progress" });
    }
  });

  fastify.delete("/missions/:id/progress/:entryId", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const { id, entryId } = request.params as { id: string; entryId: string };
    try {
      const result = await service.deleteProgressEntry(userId, id, entryId);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(err.statusCode ?? 500).send({ error: err.message ?? "Failed to delete entry" });
    }
  });
}