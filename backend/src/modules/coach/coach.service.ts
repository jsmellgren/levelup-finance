// AI Coach — isolated behind an interface so a real LLM provider can be
// swapped in later without touching routes or the frontend contract.

export interface ICoachProvider {
  ask(question: string, context: CoachContext): Promise<string>;
}

export type CoachContext = {
  level: number;
  totalDebt: number;
  totalSavings: number;
  netWorth: number;
  primaryMissionTitle?: string;
};

/** MVP implementation: canned, rule-matched responses. No external API calls. */
export class RuleBasedCoachProvider implements ICoachProvider {
  async ask(question: string, ctx: CoachContext): Promise<string> {
    const q = question.toLowerCase();

    if (q.includes("faster") && q.includes("debt")) {
      return `With $${ctx.totalDebt.toLocaleString()} left on "${ctx.primaryMissionTitle ?? "your debt mission"}", the two levers that move your payoff date most are: increasing your monthly payment amount, or targeting your highest-interest balance first. Even an extra $50/month can shave months off your timeline.`;
    }
    if (q.includes("savings") && q.includes("debt")) {
      return `A good default: keep a small starter emergency fund (around $500–$1,000) while paying down debt, then go heavier on debt once that cushion exists. That protects you from going deeper into debt if something unexpected comes up.`;
    }
    if (q.includes("save") && (q.includes("how long") || q.includes("$10,000") || q.includes("10000") || q.includes("10k"))) {
      return `Based on your current savings pace, I can estimate a timeline once you set a monthly contribution amount on your savings goal — check the goal detail page and I'll factor it into your "estimated completion date."`;
    }
    if (q.includes("side hustle")) {
      return `With $500 to start, look at low-overhead options: freelance skills you already have (writing, design, tutoring, bookkeeping), reselling, or local services. Pick one, set a 30-day income goal, and track it as a mission once side-hustle missions are supported.`;
    }
    if (q.includes("next") && q.includes("mission")) {
      return `Level ${ctx.level} and counting — nice work. Once your primary mission is close to done, a good next mission is usually whichever moves your net worth the most: either finishing off debt or starting to invest.`;
    }

    return `I can help with questions about your debt, savings, and net worth goals. Try asking things like "How can I pay off my debt faster?" or "Should I focus on savings or debt?" — full personalized AI coaching is coming in a future update.`;
  }
}
