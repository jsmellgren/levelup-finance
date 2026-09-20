// Rule-based task generator. No AI — just a template pool, so it's cheap to
// swap for something smarter later. Templates are grouped so daily generation
// can mix "quick win" habit tasks (short, low-effort, same for every mission
// type) with tasks specific to what the user is actually working toward.

import type { MissionType } from "@prisma/client";

export type TaskTemplate = { title: string; xpReward: number };

// Short, low-effort habit tasks — the "open the app for 30 seconds" hook.
// Mixed into every mission type's daily set.
export const QUICK_WIN_TASKS: TaskTemplate[] = [
  { title: "No-Spend Day — skip all non-essential spending today", xpReward: 75 },
  { title: "Track every purchase you make today", xpReward: 40 },
  { title: "Review one subscription — cancel or keep it", xpReward: 50 },
  { title: "Check your account balance", xpReward: 20 },
  { title: "Find one $5+ expense you could cut this week", xpReward: 40 },
  { title: "Move $20 toward your goal right now", xpReward: 60 },
  { title: "Avoid ordering delivery or takeout today", xpReward: 50 },
  { title: "Write down tomorrow's planned expenses before they happen", xpReward: 30 },
];

const MISSION_SPECIFIC_TASKS: Record<MissionType, TaskTemplate[]> = {
  DEBT: [
    { title: "Make your scheduled payment", xpReward: 100 },
    { title: "Put an additional $50 toward debt", xpReward: 100 },
    { title: "Avoid using your credit card today", xpReward: 60 },
    { title: "Call a lender to ask about a lower interest rate", xpReward: 80 },
    { title: "Earn an extra $100 this week", xpReward: 100 },
  ],
  SAVINGS: [
    { title: "Add money to your savings goal", xpReward: 100 },
    { title: "Set up or confirm an automatic transfer to savings", xpReward: 60 },
    { title: "Set aside a small win — $10 today", xpReward: 50 },
    { title: "Research one way to earn extra income this month", xpReward: 60 },
  ],
  NET_WORTH: [
    { title: "Update your assets and liabilities", xpReward: 50 },
    { title: "Review one recurring expense", xpReward: 50 },
    { title: "Add to an asset (savings, investing, debt paydown)", xpReward: 100 },
  ],
  CUSTOM: [
    { title: "Log progress toward your goal", xpReward: 100 },
    { title: "Review your plan for this week", xpReward: 50 },
    { title: "Take one concrete step toward your goal today", xpReward: 60 },
  ],
};

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

/** Used once, at mission creation, to seed the very first day's tasks. */
export function defaultTasksForMission(type: MissionType): TaskTemplate[] {
  const specific = MISSION_SPECIFIC_TASKS[type] ?? MISSION_SPECIFIC_TASKS.CUSTOM;
  return [...pickRandom(specific, 2), ...pickRandom(QUICK_WIN_TASKS, 2)];
}

/** Used every subsequent day to generate a fresh, varied set so there's always a reason to open the app. */
export function dailyTasksForMission(type: MissionType): TaskTemplate[] {
  const specific = MISSION_SPECIFIC_TASKS[type] ?? MISSION_SPECIFIC_TASKS.CUSTOM;
  return [...pickRandom(specific, 2), ...pickRandom(QUICK_WIN_TASKS, 2)];
}