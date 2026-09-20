import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { FriendsService } from "./friends.service.js";

const sendRequestSchema = z.object({ username: z.string().min(1) });

export default async function friendsRoutes(fastify: FastifyInstance) {
  const service = new FriendsService(fastify.prisma);
  const uid = (request: any) => (request.user as { sub: string }).sub;

  fastify.get("/friends", { preHandler: [fastify.authenticate] }, async (request) => {
    return { friends: await service.listFriends(uid(request)) };
  });

  fastify.get("/friends/requests", { preHandler: [fastify.authenticate] }, async (request) => {
    return {
      received: await service.listPendingReceived(uid(request)),
      sent: await service.listPendingSent(uid(request)),
    };
  });

  fastify.post("/friends/requests", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const parsed = sendRequestSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: "ValidationError", details: parsed.error.flatten() });
    try {
      const friendship = await service.sendRequest(uid(request), parsed.data.username);
      return reply.status(201).send({ friendship });
    } catch (err: any) {
      return reply.status(err.statusCode ?? 500).send({ error: err.message ?? "Failed to send request" });
    }
  });

  fastify.post("/friends/requests/:id/accept", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const friendship = await service.respond(uid(request), id, true);
      return reply.send({ friendship });
    } catch (err: any) {
      return reply.status(err.statusCode ?? 500).send({ error: err.message });
    }
  });

  fastify.post("/friends/requests/:id/decline", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const friendship = await service.respond(uid(request), id, false);
      return reply.send({ friendship });
    } catch (err: any) {
      return reply.status(err.statusCode ?? 500).send({ error: err.message });
    }
  });

  fastify.delete("/friends/:id", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await service.remove(uid(request), id);
      return reply.status(204).send();
    } catch (err: any) {
      return reply.status(err.statusCode ?? 500).send({ error: err.message });
    }
  });
}
