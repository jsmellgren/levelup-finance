import { z } from "zod";

export const createChallengeSchema = z.object({
  type: z.enum(["SAVINGS", "DEBT", "SPENDING", "HABIT"]),
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  targetAmount: z.number().positive().optional(),
  durationDays: z.number().int().positive().max(365),
  visibility: z.enum(["PRIVATE", "GROUP", "PUBLIC"]).default("PRIVATE"),
  groupId: z.string().optional(),
  inviteeUserIds: z.array(z.string()).optional(), // used for PRIVATE friend challenges — auto-joins them
});
export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;

export const logChallengeProgressSchema = z.object({
  amount: z.number().positive(),
});
