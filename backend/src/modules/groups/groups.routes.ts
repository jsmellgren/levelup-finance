import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { GroupsService } from "./groups.service.js";

const createGroupSchema = z.object({ name: z.string().min(1).max(80) });
const inviteSchema = z.object({ userId: z.string().min(1) });

export default async function groupsRoutes(fastify: FastifyInstance) {
  const service = new GroupsService(fastify.prisma);
  const uid = (request: any) => (request.user as { sub: string }).sub;

  fastify.get("/groups", { preHandler: [fastify.authenticate] }, async (request) => {
    return { groups: await service.listForUser(uid(request)) };
  });

  fastify.post("/groups", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const parsed = createGroupSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: "ValidationError", details: parsed.error.flatten() });
    const group = await service.create(uid(request), parsed.data.name);
    return reply.status(201).send({ group });
  });

  fastify.get("/groups/:id", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const group = await service.getById(uid(request), id);
    if (!group) return reply.status(404).send({ error: "Group not found" });
    return { group };
  });

  fastify.get("/groups/:id/leaderboard", { preHandler: [fastify.authenticate] }, async (request) => {
    const { id } = request.params as { id: string };
    return { leaderboard: await service.leaderboard(id) };
  });

  fastify.post("/groups/:id/invite", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = inviteSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: "ValidationError", details: parsed.error.flatten() });
    try {
      const membership = await service.invite(uid(request), id, parsed.data.userId);
      return reply.status(201).send({ membership });
    } catch (err: any) {
      return reply.status(err.statusCode ?? 500).send({ error: err.message });
    }
  });
}
