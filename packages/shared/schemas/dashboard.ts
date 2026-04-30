import { z } from 'zod';

import { BILLING_TRANSACTION_STATUS } from '../constants/billing';
import {
  DASHBOARD_RECENT_TRANSACTIONS_DEFAULT_LIMIT,
  DASHBOARD_RECENT_TRANSACTIONS_MAX_LIMIT,
} from '../constants/dashboard';
import {
  billingDirectionConfidenceSchema,
  billingTransactionDirectionSchema,
} from './billing';

export const dashboardMonthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, '月份格式必须为 YYYY-MM');

export const dashboardRecentTransactionsLimitSchema = z
  .number()
  .int()
  .min(1)
  .max(DASHBOARD_RECENT_TRANSACTIONS_MAX_LIMIT)
  .default(DASHBOARD_RECENT_TRANSACTIONS_DEFAULT_LIMIT);

export const dashboardCategorySummarySchema = z.object({
  amountCents: z.number().int().min(0),
  categoryId: z.string().uuid().nullable(),
  color: z.string().trim().min(1),
  icon: z.string().trim().min(1),
  name: z.string().trim().min(1),
  percentage: z.number().min(0).max(100),
  transactionCount: z.number().int().min(0),
});

export const dashboardSpotlightSchema = z.object({
  contextKey: z.string().trim().min(1),
  text: z.string().trim().min(1),
});

export const monthlySummarySchema = z.object({
  aiCoverageRate: z.number().min(0).max(100),
  aiCoveredCount: z.number().int().min(0),
  categoryBreakdown: z.array(dashboardCategorySummarySchema),
  hasTransactions: z.boolean(),
  month: dashboardMonthSchema,
  pendingConfirmationCount: z.number().int().min(0),
  pendingConfirmationExpenseCents: z.number().int().min(0),
  spotlight: dashboardSpotlightSchema.nullable(),
  totalExpenseCents: z.number().int().min(0),
  transactionCount: z.number().int().min(0),
});

export const recentTransactionSchema = z.object({
  amountCents: z.number().int(),
  categoryId: z.string().uuid().nullable(),
  categoryName: z.string().trim().min(1),
  description: z.string().nullable(),
  direction: billingTransactionDirectionSchema,
  directionConfidence: billingDirectionConfidenceSchema,
  id: z.string().uuid(),
  merchant: z.string().nullable(),
  source: z.string().nullable(),
  status: z.enum([
    BILLING_TRANSACTION_STATUS.pendingConfirmation,
    BILLING_TRANSACTION_STATUS.confirmed,
  ]),
  transactionAt: z.string().datetime(),
});

export const recentTransactionsResultSchema = z.object({
  hasMore: z.boolean(),
  limit: z.number().int().min(1).max(DASHBOARD_RECENT_TRANSACTIONS_MAX_LIMIT),
  transactions: z.array(recentTransactionSchema),
});

export type DashboardMonthInput = z.infer<typeof dashboardMonthSchema>;
export type DashboardRecentTransactionsLimitInput = z.infer<
  typeof dashboardRecentTransactionsLimitSchema
>;
export type MonthlySummaryInput = z.infer<typeof monthlySummarySchema>;
export type RecentTransactionsResultInput = z.infer<
  typeof recentTransactionsResultSchema
>;

