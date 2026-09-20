import type { FastifyInstance } from "fastify";
import { createChallengeSchema, logChallengeProgressSchema } from "./challenges.schema.js";
import { ChallengesService } from "./challenges.service.js";
import { CHALLENGE_TEMPLATES } from "../../lib/challengeTemplates.js";

export default async function challengesRoutes(fastify: FastifyInstance) {
  const service = new ChallengesService(fastify.prisma);
  const uid = (request: any) => (request.user as { sub: string }).sub;

  fastify.get("/challenges/templates", { preHandler: [fastify.authenticate] }, async () => {
    return { templates: CHALLENGE_TEMPLATES };
  });

  fastify.get("/challenges", { preHandler: [fastify.authenticate] }, async (request) => {
    const { scope } = request.query as { scope?: string };
    if (scope === "public") {
      return { challenges: await service.listPublic() };
    }
    return { challenges: await service.listMine(uid(request)) };
  });

  fastify.post("/challenges", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const parsed = createChallengeSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: "ValidationError", details: parsed.error.flatten() });
    const challenge = await service.create(uid(request), parsed.data);
    return reply.status(201).send({ challenge });
  });

  fastify.get("/challenges/:id", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const challenge = await service.getById(uid(request), id);
    if (!challenge) return reply.status(404).send({ error: "Challenge not found" });
    return { challenge };
  });

  fastify.post("/challenges/:id/join", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const participant = await service.join(uid(request), id);
      return reply.status(201).send({ participant });
    } catch (err: any) {
      return reply.status(err.statusCode ?? 500).send({ error: err.message });
    }
  });

  fastify.post("/challenges/join/:shareSlug", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { shareSlug } = request.params as { shareSlug: string };
    try {
      const participant = await service.joinByShareSlug(uid(request), shareSlug);
      return reply.status(201).send({ participant });
    } catch (err: any) {
      return reply.status(err.statusCode ?? 500).send({ error: err.message });
    }
  });

  fastify.post("/challenges/:id/progress", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = logChallengeProgressSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: "ValidationError", details: parsed.error.flatten() });
    try {
      const result = await service.logProgress(uid(request), id, parsed.data.amount);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(err.statusCode ?? 500).send({ error: err.message });
    }
  });
}