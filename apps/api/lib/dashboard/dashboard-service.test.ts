import { describe, expect, it } from 'vitest';

import { type DashboardRepository, DashboardService } from './dashboard-service';

function createRepository(
  overrides: Partial<DashboardRepository> = {},
): DashboardRepository {
  return {
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
      pendingConfirmationExpenseCents: 0,
      spotlight: null,
      totalExpenseCents: 0,
      transactionCount: 0,
    });
  });

  it('aggregates confirmed expense by category and separates pending expense', async () => {
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
            direction: 'expense',
            direction_confidence: 'high',
            merchant: '咖啡店',
            source: 'alipay_csv',
            status: 'confirmed',
            transaction_at: '2026-04-10T02:00:00.000Z',
          },
          {
            amount_cents: -800,
            category_id: null,
            description: null,
            direction: 'expense',
            direction_confidence: 'high',
            merchant: '便利店',
            source: 'wechat_csv',
            status: 'confirmed',
            transaction_at: '2026-04-11T02:00:00.000Z',
          },
          {
            amount_cents: -500,
            category_id: null,
            description: null,
            direction: 'expense',
            direction_confidence: 'low',
            merchant: '待确认商户',
            source: 'wechat_csv',
            status: 'pending_confirmation',
            transaction_at: '2026-04-12T02:00:00.000Z',
          },
          {
            amount_cents: 300000,
            category_id: null,
            description: '工资',
            direction: 'income',
            direction_confidence: 'high',
            merchant: '公司',
            source: 'alipay_csv',
            status: 'confirmed',
            transaction_at: '2026-04-13T02:00:00.000Z',
          },
          {
            amount_cents: 1200,
            category_id: null,
            description: '退款',
            direction: 'refund',
            direction_confidence: 'high',
            merchant: '商户',
            source: 'alipay_csv',
            status: 'confirmed',
            transaction_at: '2026-04-14T02:00:00.000Z',
          },
          {
            amount_cents: 999,
            category_id: null,
            description: '关闭',
            direction: 'closed',
            direction_confidence: 'high',
            merchant: '商户',
            source: 'wechat_csv',
            status: 'confirmed',
            transaction_at: '2026-04-15T02:00:00.000Z',
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
      pendingConfirmationExpenseCents: 500,
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

  it('does not count pending income refund or closed transactions as expense', async () => {
    const service = new DashboardService(
      createRepository({
        listMonthTransactions: async () => [
          {
            amount_cents: 9000,
            category_id: null,
            description: '工资',
            direction: 'income',
            direction_confidence: 'high',
            merchant: '公司',
            source: 'alipay_csv',
            status: 'confirmed',
            transaction_at: '2026-04-10T02:00:00.000Z',
          },
          {
            amount_cents: 1500,
            category_id: null,
            description: '退款',
            direction: 'refund',
            direction_confidence: 'high',
            merchant: '商户',
            source: 'wechat_csv',
            status: 'confirmed',
            transaction_at: '2026-04-11T02:00:00.000Z',
          },
          {
            amount_cents: 2000,
            category_id: null,
            description: '关闭',
            direction: 'closed',
            direction_confidence: 'high',
            merchant: '商户',
            source: 'wechat_csv',
            status: 'confirmed',
            transaction_at: '2026-04-12T02:00:00.000Z',
          },
          {
            amount_cents: -700,
            category_id: null,
            description: '待确认支出',
            direction: 'expense',
            direction_confidence: 'low',
            merchant: '便利店',
            source: 'wechat_csv',
            status: 'pending_confirmation',
            transaction_at: '2026-04-13T02:00:00.000Z',
          },
        ],
      }),
    );

    await expect(
      service.getMonthlySummary({
        month: '2026-04',
        userId: 'user-1',
      }),
    ).resolves.toMatchObject({
      hasTransactions: true,
      pendingConfirmationCount: 1,
      pendingConfirmationExpenseCents: 700,
      totalExpenseCents: 0,
      transactionCount: 0,
    });
  });

  it('does not infer positive-only income months as expense and keeps expense status buckets intact', async () => {
    const service = new DashboardService(
      createRepository({
        listMonthTransactions: async () => [
          {
            amount_cents: 250000,
            category_id: null,
            description: '工资',
            direction: 'income',
            direction_confidence: 'high',
            merchant: '公司',
            source: 'alipay_csv',
            status: 'confirmed',
            transaction_at: '2026-04-01T02:00:00.000Z',
          },
          {
            amount_cents: 3000,
            category_id: null,
            description: '报销',
            direction: 'refund',
            direction_confidence: 'high',
            merchant: '商户',
            source: 'wechat_csv',
            status: 'confirmed',
            transaction_at: '2026-04-02T02:00:00.000Z',
          },
          {
            amount_cents: -1200,
            category_id: null,
            description: '咖啡',
            direction: 'expense',
            direction_confidence: 'high',
            merchant: '咖啡店',
            source: 'alipay_csv',
            status: 'confirmed',
            transaction_at: '2026-04-03T02:00:00.000Z',
          },
          {
            amount_cents: -800,
            category_id: null,
            description: '待确认支出',
            direction: 'expense',
            direction_confidence: 'low',
            merchant: '便利店',
            source: 'wechat_csv',
            status: 'pending_confirmation',
            transaction_at: '2026-04-04T02:00:00.000Z',
          },
        ],
      }),
    );

    await expect(
      service.getMonthlySummary({
        month: '2026-04',
        userId: 'user-1',
      }),
    ).resolves.toMatchObject({
      hasTransactions: true,
      pendingConfirmationCount: 1,
      pendingConfirmationExpenseCents: 800,
      totalExpenseCents: 1200,
      transactionCount: 1,
    });
  });
});

