import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { RuleBasedCoachProvider } from "./coach.service.js";

const askSchema = z.object({ question: z.string().min(1) });

export default async function coachRoutes(fastify: FastifyInstance) {
  // Swap this for a real LLM-backed provider later — routes/frontend contract unchanged.
  const provider = new RuleBasedCoachProvider();

  fastify.post("/coach/ask", { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub;
    const parsed = askSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "ValidationError", details: parsed.error.flatten() });
    }

    const user = await fastify.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const missions = await fastify.prisma.mission.findMany({ where: { userId }, include: { goal: true } });

    let totalDebt = 0;
    let totalSavings = 0;
    const primary = missions.find((m) => m.isPrimary);

    for (const m of missions) {
      if (!m.goal) continue;
      if (m.type === "DEBT") totalDebt += Math.max(0, Number(m.goal.targetAmount) - Number(m.goal.currentAmount));
      if (m.type === "SAVINGS") totalSavings += Number(m.goal.currentAmount);
    }

    const answer = await provider.ask(parsed.data.question, {
      level: user.level,
      totalDebt,
      totalSavings,
      netWorth: totalSavings - totalDebt,
      primaryMissionTitle: primary?.title,
    });

    return reply.send({ answer });
  });
}
