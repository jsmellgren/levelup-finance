// XP / leveling engine. Kept as pure functions + a simple lookup table so the
// curve can be tuned later without touching call sites.

export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  500,    // Level 2
  1000,   // Level 3
  2000,   // Level 4
  3500,   // Level 5
  5500,   // Level 6
  8000,   // Level 7
  11000,  // Level 8
  15000,  // Level 9
  20000,  // Level 10
];

export function levelForXP(totalXP: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    }
  }
  return level;
}

export function xpProgress(totalXP: number): { level: number; currentLevelFloor: number; nextLevelCeiling: number; percentToNext: number } {
  const level = levelForXP(totalXP);
  const currentLevelFloor = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextLevelCeiling = LEVEL_THRESHOLDS[level] ?? currentLevelFloor + 5000;
  const span = nextLevelCeiling - currentLevelFloor;
  const percentToNext = span > 0 ? Math.min(100, ((totalXP - currentLevelFloor) / span) * 100) : 100;
  return { level, currentLevelFloor, nextLevelCeiling, percentToNext };
}

export const XP_REWARDS = {
  LOG_PAYMENT: 100,
  LOG_CONTRIBUTION: 100,
  COMPLETE_TASK: 50,
  REACH_MILESTONE: 500,
  WEEKLY_CHALLENGE: 250,
  CHALLENGE_PROGRESS: 20,
  CHALLENGE_WIN_BONUS: 500,
} as const;
