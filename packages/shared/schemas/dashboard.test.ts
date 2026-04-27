import { describe, expect, it } from 'vitest';

import {
  dashboardMonthSchema,
  dashboardRecentTransactionsLimitSchema,
  monthlySummarySchema,
  recentTransactionsResultSchema,
} from './dashboard';

describe('dashboard schemas', () => {
  it('validates month inputs as YYYY-MM', () => {
    expect(dashboardMonthSchema.parse('2026-04')).toBe('2026-04');
    expect(() => dashboardMonthSchema.parse('2026-4')).toThrow();
    expect(() => dashboardMonthSchema.parse('2026-13')).toThrow();
  });

  it('applies recent transaction limit bounds', () => {
    expect(dashboardRecentTransactionsLimitSchema.parse(undefined)).toBe(10);
    expect(dashboardRecentTransactionsLimitSchema.parse(50)).toBe(50);
    expect(() => dashboardRecentTransactionsLimitSchema.parse(51)).toThrow();
  });

  it('validates monthly summary responses', () => {
    expect(
      monthlySummarySchema.parse({
        aiCoverageRate: 75,
        aiCoveredCount: 3,
        categoryBreakdown: [
          {
            amountCents: 1200,
            categoryId: null,
            color: '#6B7280',
            icon: '📦',
            name: '其他',
            percentage: 100,
            transactionCount: 4,
          },
        ],
        hasTransactions: true,
        month: '2026-04',
        pendingConfirmationCount: 1,
        spotlight: {
          contextKey: 'top-category',
          text: '本月其他支出最多，共 12 元。',
        },
        totalExpenseCents: 1200,
        transactionCount: 4,
      }),
    ).toMatchObject({
      hasTransactions: true,
      pendingConfirmationCount: 1,
    });
  });

  it('validates recent transaction responses', () => {
    expect(
      recentTransactionsResultSchema.parse({
        hasMore: false,
        limit: 10,
        transactions: [
          {
            amountCents: 990,
            categoryId: null,
            categoryName: '其他',
            description: null,
            id: '11111111-1111-4111-8111-111111111111',
            merchant: '便利店',
            source: 'alipay_csv',
            status: 'pending_confirmation',
            transactionAt: '2026-04-27T01:20:00.000Z',
          },
        ],
      }),
    ).toMatchObject({
      transactions: [expect.objectContaining({ merchant: '便利店' })],
    });
  });
});

