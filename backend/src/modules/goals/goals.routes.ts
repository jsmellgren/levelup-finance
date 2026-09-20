import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { GoalsService } from "./goals.service.js";

const inviteSchema = z.object({ userId: z.string().min(1) });
const contributeSchema = z.object({ amount: z.number().positive(), note: z.string().max(200).optional() });

export default async function goalsRoutes(fastify: FastifyInstance) {
  const service = new GoalsService(fastify.prisma);
  const uid = (request: any) => (request.user as { sub: string }).sub;

  fastify.post("/goals/:id/invite", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = inviteSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: "ValidationError", details: parsed.error.flatten() });
    try {
      const contributor = await service.invite(uid(request), id, parsed.data.userId);
      return reply.status(201).send({ contributor });
    } catch (err: any) {
      return reply.status(err.statusCode ?? 500).send({ error: err.message });
    }
  });

  fastify.post("/goals/:id/contribute", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = contributeSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: "ValidationError", details: parsed.error.flatten() });
    try {
      const result = await service.contribute(uid(request), id, parsed.data.amount, parsed.data.note);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(err.statusCode ?? 500).send({ error: err.message });
    }
  });

  fastify.get("/goals/:id/contributions", { preHandler: [fastify.authenticate] }, async (request) => {
    const { id } = request.params as { id: string };
    return { contributions: await service.listContributions(id) };
  });
}
