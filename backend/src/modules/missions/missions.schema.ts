import { z } from "zod";

export const createMissionSchema = z.object({
  type: z.enum(["DEBT", "SAVINGS", "NET_WORTH", "CUSTOM"]),
  title: z.string().min(1),
  // Common goal fields
  currentAmount: z.number().nonnegative(),
  targetAmount: z.number().positive(),
  targetDate: z.string().datetime().optional().nullable(),
  monthlyContribution: z.number().nonnegative().optional().nullable(),
  interestRate: z.number().nonnegative().optional().nullable(),
});
export type CreateMissionInput = z.infer<typeof createMissionSchema>;

export const logProgressSchema = z.object({
  amount: z.number(),
  note: z.string().optional(),
});
export type LogProgressInput = z.infer<typeof logProgressSchema>;
