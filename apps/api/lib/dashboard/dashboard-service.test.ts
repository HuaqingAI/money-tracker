import { describe, expect, it } from 'vitest';

import { type DashboardRepository,DashboardService } from './dashboard-service';

function createRepository(
  overrides: Partial<DashboardRepository> = {},
): DashboardRepository {
  return {
    getMonthlySummaryRow: async () => null,
    listCategories: async () => [],
    listMonthTransactions: async () => [],
    ...overrides,
  };
}

describe('DashboardService', () => {
  it('returns an empty dashboard summary when no transactions exist', async () => {
    const service = new DashboardService(createRepository());

    await expect(
      service.getMonthlySummary({
        month: '2026-04',
        userId: 'user-1',
      }),
    ).resolves.toEqual({
      aiCoverageRate: 0,
      aiCoveredCount: 0,
      categoryBreakdown: [],
      hasTransactions: false,
      month: '2026-04',
      pendingConfirmationCount: 0,
      spotlight: null,
      totalExpenseCents: 0,
      transactionCount: 0,
    });
  });

  it('aggregates realtime transactions by category and pending count', async () => {
    const service = new DashboardService(
      createRepository({
        listCategories: async () => [
          {
            icon: null,
            id: '11111111-1111-4111-8111-111111111111',
            name: '餐饮',
          },
        ],
        listMonthTransactions: async () => [
          {
            amount_cents: -1200,
            category_id: '11111111-1111-4111-8111-111111111111',
            description: null,
            merchant: '咖啡店',
            source: 'alipay_csv',
            status: 'pending_confirmation',
            transaction_at: '2026-04-10T02:00:00.000Z',
          },
          {
            amount_cents: -800,
            category_id: null,
            description: null,
            merchant: '便利店',
            source: 'wechat_csv',
            status: 'confirmed',
            transaction_at: '2026-04-11T02:00:00.000Z',
          },
        ],
      }),
    );

    const result = await service.getMonthlySummary({
      month: '2026-04',
      userId: 'user-1',
    });

    expect(result).toMatchObject({
      aiCoverageRate: 50,
      aiCoveredCount: 1,
      hasTransactions: true,
      pendingConfirmationCount: 1,
      totalExpenseCents: 2000,
      transactionCount: 2,
    });
    expect(result.categoryBreakdown).toEqual([
      expect.objectContaining({
        amountCents: 1200,
        categoryId: '11111111-1111-4111-8111-111111111111',
        name: '餐饮',
        percentage: 60,
      }),
      expect.objectContaining({
        amountCents: 800,
        categoryId: null,
        name: '其他',
        percentage: 40,
      }),
    ]);
    expect(result.spotlight).toEqual({
      contextKey: 'pending-confirmation',
      text: '有 1 笔交易待确认，处理后分类会更清楚。',
    });
  });

  it('uses analytics monthly summary when populated', async () => {
    const service = new DashboardService(
      createRepository({
        getMonthlySummaryRow: async () => ({
          category_breakdown: {
            '11111111-1111-4111-8111-111111111111': {
              amount_cents: 3600,
              count: 3,
            },
          },
          month: '2026-04-01',
          total_cents: 3600,
        }),
        listCategories: async () => [
          {
            icon: null,
            id: '11111111-1111-4111-8111-111111111111',
            name: '交通',
          },
        ],
        listMonthTransactions: async () => [],
      }),
    );

    await expect(
      service.getMonthlySummary({
        month: '2026-04',
        userId: 'user-1',
      }),
    ).resolves.toMatchObject({
      categoryBreakdown: [
        expect.objectContaining({
          amountCents: 3600,
          name: '交通',
          percentage: 100,
        }),
      ],
      hasTransactions: true,
      totalExpenseCents: 3600,
      transactionCount: 3,
    });
  });
});

