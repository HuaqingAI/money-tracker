import { z } from 'zod';

export const monthStringSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'month must use YYYY-MM format');

export const monthlySummaryQuerySchema = z.object({
  includePending: z
    .preprocess((value) => {
      if (value === undefined || value === null || value === '') {
        return false;
      }
      if (value === 'true') {
        return true;
      }
      if (value === 'false') {
        return false;
      }
      return value;
    }, z.boolean())
    .default(false),
  month: monthStringSchema,
});

export const monthlyTrendQuerySchema = z.object({
  months: z.coerce
    .number()
    .int('months must be an integer')
    .min(1, 'months must be at least 1')
    .max(24, 'months must be at most 24')
    .default(12),
});

export type MonthlySummaryQuery = z.infer<typeof monthlySummaryQuerySchema>;
export type MonthlyTrendQuery = z.infer<typeof monthlyTrendQuerySchema>;
