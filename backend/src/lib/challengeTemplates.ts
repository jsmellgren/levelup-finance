// Preset challenge templates. Purely data — the Challenge/ChallengeParticipant tables already
// support everything these need (type, targetAmount, durationDays), so this needs no schema change.
// "HABIT"-type templates use targetAmount as a day-count target (participants log "1" per day
// completed) rather than a dollar amount — the existing progress-logging flow handles either.

export type ChallengeTemplate = {
  key: string;
  title: string;
  description: string;
  type: "SAVINGS" | "DEBT" | "SPENDING" | "HABIT";
  targetAmount?: number;
  durationDays: number;
  icon: string;
};

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    key: "no_spend_weekend",
    title: "No-Spend Weekend",
    description: "Skip all non-essential spending for one weekend.",
    type: "SPENDING",
    durationDays: 2,
    icon: "🚫",
  },
  {
    key: "no_spend_week",
    title: "No-Spend Week",
    description: "A full 7 days with zero non-essential purchases.",
    type: "SPENDING",
    durationDays: 7,
    icon: "🧊",
  },
  {
    key: "save_100_30",
    title: "Save $100 in 30 Days",
    description: "A beginner-friendly savings sprint.",
    type: "SAVINGS",
    targetAmount: 100,
    durationDays: 30,
    icon: "💰",
  },
  {
    key: "save_500_30",
    title: "Save $500 in 30 Days",
    description: "A bigger savings push for one month.",
    type: "SAVINGS",
    targetAmount: 500,
    durationDays: 30,
    icon: "💵",
  },
  {
    key: "save_1000_60",
    title: "Save $1,000 in 60 Days",
    description: "Two months to build a real cushion.",
    type: "SAVINGS",
    targetAmount: 1000,
    durationDays: 60,
    icon: "🏦",
  },
  {
    key: "debt_sprint_250",
    title: "Pay $250 Toward Debt This Month",
    description: "A focused 30-day debt paydown push.",
    type: "DEBT",
    targetAmount: 250,
    durationDays: 30,
    icon: "⚔️",
  },
  {
    key: "subscription_audit",
    title: "30-Day Subscription Audit",
    description: "Review and cut unused subscriptions over a month.",
    type: "SPENDING",
    durationDays: 30,
    icon: "🔍",
  },
  {
    key: "streak_battle_7",
    title: "7-Day Streak Battle",
    description: "Whoever keeps their daily streak alive the longest wins.",
    type: "HABIT",
    targetAmount: 7,
    durationDays: 7,
    icon: "🔥",
  },
  {
    key: "streak_battle_30",
    title: "30-Day Streak Battle",
    description: "A full month — last one with an unbroken streak wins.",
    type: "HABIT",
    targetAmount: 30,
    durationDays: 30,
    icon: "🔥",
  },
  {
    key: "eating_out_7",
    title: "7-Day Eating-Out Challenge",
    description: "No restaurants or delivery for a full week.",
    type: "SPENDING",
    durationDays: 7,
    icon: "🍳",
  },
  {
    key: "side_hustle_500",
    title: "Earn an Extra $500 This Month",
    description: "A side-hustle income push, tracked like a savings goal.",
    type: "SAVINGS",
    targetAmount: 500,
    durationDays: 30,
    icon: "🚀",
  },
];