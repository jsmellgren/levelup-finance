// Mirrors backend/src/lib/xp.ts so the dashboard/profile can render level
// progress without an extra round trip. Keep the two curves in sync.
const LEVEL_THRESHOLDS = [0, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000, 20000];

export function xpProgress(totalXP: number) {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  const floor = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const ceiling = LEVEL_THRESHOLDS[level] ?? floor + 5000;
  const span = ceiling - floor;
  const percentToNext = span > 0 ? Math.min(100, ((totalXP - floor) / span) * 100) : 100;
  return { level, percentToNext, ceiling };
}

export function formatCurrency(amount: number) {
  return amount.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
