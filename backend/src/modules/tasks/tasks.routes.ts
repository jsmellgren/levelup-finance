import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { TasksService } from "./tasks.service.js";

const updateStatusSchema = z.object({ status: z.enum(["COMPLETED", "SKIPPED", "PENDING"]) });

export default async function tasksRoutes(fastify: FastifyInstance) {
  const service = new TasksService(fastify.prisma);

  fastify.get("/tasks/today", { preHandler: [fastify.authenticate] }, async (request) => {
    const userId = (request.user as { sub: string }).sub;
    return { tasks: await service.listToday(userId) };
  });

  fastify.patch("/tasks/:id", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const { id } = request.params as { id: string };
    const parsed = updateStatusSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "ValidationError", details: parsed.error.flatten() });
    }
    try {
      const task = await service.updateStatus(userId, id, parsed.data.status);
      return reply.send({ task });
    } catch (err: any) {
      return reply.status(err.statusCode ?? 500).send({ error: err.message ?? "Failed to update task" });
    }
  });
}
