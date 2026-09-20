// Static achievement catalog. Seeded into the DB (see prisma/seed.ts) and
// referenced by key from the unlock-checking logic in achievements.service.ts.

export const ACHIEVEMENT_CATALOG = [
  { key: "first_payment", title: "First Payment", description: "Logged your first debt payment.", icon: "🎯" },
  { key: "first_500_saved", title: "First $500 Saved", description: "Reached $500 in savings progress.", icon: "💰" },
  { key: "first_1000_saved", title: "First $1,000 Saved", description: "Reached $1,000 in savings progress.", icon: "🏦" },
  { key: "debt_paid_off", title: "Paid Off First Debt", description: "Fully paid off a debt goal.", icon: "🎉" },
  { key: "streak_30", title: "30-Day Streak", description: "Stayed active for 30 days in a row.", icon: "🔥" },
  { key: "net_worth_10k", title: "$10K Net Worth", description: "Reached $10,000 net worth.", icon: "📈" },
  { key: "debt_free", title: "Debt Free", description: "Paid off all tracked debt.", icon: "🏆" },
  { key: "first_100k", title: "First $100K", description: "Reached $100,000 toward a goal.", icon: "👑" },
  { key: "first_challenge_completed", title: "First Challenge Completed", description: "Completed your first challenge.", icon: "✅" },
  { key: "challenge_champion", title: "Challenge Champion", description: "Won a head-to-head or group challenge.", icon: "🥇" },
  { key: "streak_7", title: "7-Day Streak", description: "Stayed active for 7 days in a row.", icon: "🔥" },
  { key: "first_friend", title: "First Friend", description: "Made your first friend connection.", icon: "🤝" },
] as const;
