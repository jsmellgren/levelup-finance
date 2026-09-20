import type { FastifyInstance } from "fastify";

export default async function overviewRoutes(fastify: FastifyInstance) {
  fastify.get("/overview", { preHandler: [fastify.authenticate] }, async (request) => {
    const userId = (request.user as { sub: string }).sub;

    const missions = await fastify.prisma.mission.findMany({
      where: { userId },
      include: { goal: true },
    });

    let totalDebt = 0;
    let totalSavings = 0;
    let totalAssets = 0;
    let totalLiabilities = 0;

    for (const m of missions) {
      if (!m.goal) continue;
      const remaining = Math.max(0, Number(m.goal.targetAmount) - Number(m.goal.currentAmount));
      if (m.type === "DEBT") {
        totalDebt += remaining;
        totalLiabilities += remaining;
      } else if (m.type === "SAVINGS") {
        totalSavings += Number(m.goal.currentAmount);
        totalAssets += Number(m.goal.currentAmount);
      } else if (m.type === "NET_WORTH") {
        totalAssets += Number(m.goal.currentAmount);
      }
    }

    const netWorth = totalAssets - totalLiabilities;

    const user = await fastify.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    return {
      netWorth,
      totalAssets,
      totalLiabilities,
      totalSavings,
      totalDebt,
      // Income/expenses aren't collected yet in the MVP onboarding flow —
      // placeholder zeros so the Financial Overview screen has a stable shape
      // until a "monthly cash flow" settings field is added.
      monthlyIncome: 0,
      monthlyExpenses: 0,
      user: { level: user.level, totalXP: user.totalXP, currentStreak: user.currentStreak },
    };
  });
}
