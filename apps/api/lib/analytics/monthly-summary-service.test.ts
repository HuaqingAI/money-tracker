import { beforeEach, describe, expect, it, vi } from 'vitest';

const queryState = vi.hoisted(() => ({
  categoriesRows: [] as Array<{
    amount_cents: number;
    category_id: string | null;
    categories: { name: string } | null;
  }>,
  monthlyRows: [] as Array<{
    category_breakdown: unknown;
    month: string;
    total_cents: number;
  }>,
  transactionRows: [] as Array<{
    amount_cents: number;
    category_id: string | null;
    categories: { name: string } | null;
  }>,
}));

const getSupabaseAdminMock = vi.hoisted(() =>
  vi.fn(() => {
    const createQuery = (table: string) => {
      const query = {
        eq: vi.fn(() => query),
        from: vi.fn(() => query),
        gte: vi.fn(() => query),
        in: vi.fn(() => query),
        limit: vi.fn(() => query),
        lte: vi.fn(() => query),
        lt: vi.fn(() => query),
        order: vi.fn(() => query),
        select: vi.fn(() => query),
        single: vi.fn(() => {
          if (table === 'monthly_summaries') {
            const row = queryState.monthlyRows[0] ?? null;
            return Promise.resolve(
              row
                ? { data: row, error: null }
                : { data: null, error: { code: 'PGRST116', message: 'not found' } },
            );
          }

          return Promise.resolve({ data: null, error: null });
        }),
        then: (
          resolve: (value: { data: unknown; error: null }) => void,
          reject: (reason?: unknown) => void,
        ) => {
          if (table === 'transactions') {
            return Promise.resolve({
              data: queryState.transactionRows,
              error: null,
            }).then(resolve, reject);
          }

          if (table === 'monthly_summaries') {
            return Promise.resolve({
              data: queryState.monthlyRows,
              error: null,
            }).then(resolve, reject);
          }

          if (table === 'categories') {
            return Promise.resolve({
              data: queryState.categoriesRows,
              error: null,
            }).then(resolve, reject);
          }

          return Promise.resolve({ data: [], error: null }).then(resolve, reject);
        },
      };
      return query;
    };

    return {
      schema: vi.fn(() => ({
        from: vi.fn((table: string) => createQuery(table)),
      })),
    };
  }),
);

vi.mock('../db/supabase-admin', () => ({
  getSupabaseAdmin: getSupabaseAdminMock,
}));

import {
  getMonthlySummary,
  getMonthlyTrend,
} from './monthly-summary-service';

describe('monthly-summary-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryState.categoriesRows = [];
    queryState.monthlyRows = [];
    queryState.transactionRows = [];
  });

  it('falls back to live confirmed transactions when no precomputed summary exists', async () => {
    queryState.transactionRows = [
      {
        amount_cents: -3200,
        categories: { name: '餐饮' },
        category_id: 'cat-food',
      },
      {
        amount_cents: -1800,
        categories: { name: '交通' },
        category_id: 'cat-transport',
      },
    ];

    const summary = await getMonthlySummary('user-1', '2026-04');

    expect(summary.source).toBe('live');
    expect(summary.month).toBe('2026-04');
    expect(summary.monthStart).toBe('2026-04-01T00:00:00.000Z');
    expect(summary.monthEnd).toBe('2026-05-01T00:00:00.000Z');
    expect(summary.totalExpenseCents).toBe(5000);
    expect(summary.transactionCount).toBe(2);
    expect(summary.categories).toEqual([
      {
        amountCents: 3200,
        categoryId: 'cat-food',
        categoryName: '餐饮',
        percentage: 64,
        transactionCount: 1,
      },
      {
        amountCents: 1800,
        categoryId: 'cat-transport',
        categoryName: '交通',
        percentage: 36,
        transactionCount: 1,
      },
    ]);
  });

  it('uses precomputed monthly summaries when available', async () => {
    queryState.monthlyRows = [
      {
        category_breakdown: {
          'cat-food': {
            amount_cents: 3000,
            category_name: '餐饮',
            count: 3,
          },
          uncategorized: {
            amount_cents: 1000,
            count: 1,
          },
        },
        month: '2026-04-01',
        total_cents: 4000,
      },
    ];

    const summary = await getMonthlySummary('user-1', '2026-04');

    expect(summary.source).toBe('precomputed');
    expect(summary.totalExpenseCents).toBe(4000);
    expect(summary.transactionCount).toBe(4);
    expect(summary.categories).toEqual([
      {
        amountCents: 3000,
        categoryId: 'cat-food',
        categoryName: '餐饮',
        percentage: 75,
        transactionCount: 3,
      },
      {
        amountCents: 1000,
        categoryId: null,
        categoryName: '其他',
        percentage: 25,
        transactionCount: 1,
      },
    ]);
  });

  it('falls back to live transactions when a precomputed summary is empty', async () => {
    queryState.monthlyRows = [
      {
        category_breakdown: {},
        month: '2026-04-01',
        total_cents: 0,
      },
    ];
    queryState.transactionRows = [
      {
        amount_cents: -4200,
        categories: { name: '餐饮' },
        category_id: 'cat-food',
      },
    ];

    const summary = await getMonthlySummary('user-1', '2026-04');

    expect(summary.source).toBe('live');
    expect(summary.totalExpenseCents).toBe(4200);
    expect(summary.transactionCount).toBe(1);
    expect(summary.categories).toEqual([
      expect.objectContaining({
        amountCents: 4200,
        categoryId: 'cat-food',
        transactionCount: 1,
      }),
    ]);
  });

  it('returns trend points for the requested month window', async () => {
    queryState.monthlyRows = [
      {
        category_breakdown: { 'cat-food': { amount_cents: 1000, count: 1 } },
        month: '2026-03-01',
        total_cents: 1000,
      },
      {
        category_breakdown: { 'cat-food': { amount_cents: 2500, count: 2 } },
        month: '2026-04-01',
        total_cents: 2500,
      },
    ];

    const trend = await getMonthlyTrend('user-1', 2, '2026-04');

    expect(trend).toEqual({
      endMonth: '2026-04',
      months: 2,
      points: [
        {
          month: '2026-03',
          totalExpenseCents: 1000,
          transactionCount: 1,
        },
        {
          month: '2026-04',
          totalExpenseCents: 2500,
          transactionCount: 2,
        },
      ],
      startMonth: '2026-03',
    });
  });
});
