import { beforeEach, describe, expect, it, vi } from 'vitest';

interface CategoryFixtureRow {
  id: string;
  name: string;
}

interface MonthlyFixtureRow {
  category_breakdown: unknown;
  month: string;
  total_cents: number;
  user_id: string;
}

interface TransactionFixtureRow {
  amount_cents: number;
  category_id: string | null;
  categories: { name: string } | null;
  status: 'confirmed' | 'pending_confirmation' | 'rejected';
  transaction_at: string;
  user_id: string;
}

const queryState = vi.hoisted(() => ({
  categoriesRows: [] as CategoryFixtureRow[],
  monthlyRows: [] as MonthlyFixtureRow[],
  transactionRows: [] as TransactionFixtureRow[],
}));

const getSupabaseAdminMock = vi.hoisted(() =>
  vi.fn(() => {
    const createQuery = (table: string) => {
      const eqFilters = new Map<string, unknown>();
      const gteFilters = new Map<string, string>();
      const inFilters = new Map<string, string[]>();
      const ltFilters = new Map<string, string>();
      const lteFilters = new Map<string, string>();

      function readField(row: unknown, column: string): unknown {
        return (row as Record<string, unknown>)[column];
      }

      function matchesFilters<T>(row: T): boolean {
        for (const [column, value] of eqFilters) {
          if (readField(row, column) !== value) {
            return false;
          }
        }

        for (const [column, values] of inFilters) {
          const field = readField(row, column);
          if (typeof field !== 'string' || !values.includes(field)) {
            return false;
          }
        }

        for (const [column, value] of gteFilters) {
          const field = readField(row, column);
          if (typeof field !== 'string' || field < value) {
            return false;
          }
        }

        for (const [column, value] of ltFilters) {
          const field = readField(row, column);
          if (typeof field !== 'string' || field >= value) {
            return false;
          }
        }

        for (const [column, value] of lteFilters) {
          const field = readField(row, column);
          if (typeof field !== 'string' || field > value) {
            return false;
          }
        }

        return true;
      }

      function resolveRows(): unknown[] {
        if (table === 'transactions') {
          return queryState.transactionRows.filter(matchesFilters);
        }

        if (table === 'monthly_summaries') {
          return queryState.monthlyRows.filter(matchesFilters);
        }

        if (table === 'categories') {
          return queryState.categoriesRows.filter(matchesFilters);
        }

        return [];
      }

      const query = {
        eq: vi.fn((column: string, value: unknown) => {
          eqFilters.set(column, value);
          return query;
        }),
        from: vi.fn(() => query),
        gte: vi.fn((column: string, value: string) => {
          gteFilters.set(column, value);
          return query;
        }),
        in: vi.fn((column: string, values: string[]) => {
          inFilters.set(column, values);
          return query;
        }),
        limit: vi.fn(() => query),
        lte: vi.fn((column: string, value: string) => {
          lteFilters.set(column, value);
          return query;
        }),
        lt: vi.fn((column: string, value: string) => {
          ltFilters.set(column, value);
          return query;
        }),
        order: vi.fn(() => query),
        select: vi.fn(() => query),
        single: vi.fn(() => {
          const row = resolveRows()[0] ?? null;
          return Promise.resolve(
            row
              ? { data: row, error: null }
              : { data: null, error: { code: 'PGRST116', message: 'not found' } },
          );
        }),
        then: (
          resolve: (value: { data: unknown; error: null }) => void,
          reject: (reason?: unknown) => void,
        ) =>
          Promise.resolve({
            data: resolveRows(),
            error: null,
          }).then(resolve, reject),
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

  it('falls back to live pending and confirmed transactions for the requested user and month', async () => {
    queryState.transactionRows = [
      {
        amount_cents: -3200,
        categories: { name: 'Food' },
        category_id: 'cat-food',
        status: 'pending_confirmation',
        transaction_at: '2026-04-10T00:00:00.000Z',
        user_id: 'user-1',
      },
      {
        amount_cents: -1800,
        categories: { name: 'Transport' },
        category_id: 'cat-transport',
        status: 'confirmed',
        transaction_at: '2026-04-11T00:00:00.000Z',
        user_id: 'user-1',
      },
      {
        amount_cents: -900,
        categories: { name: 'Other' },
        category_id: null,
        status: 'rejected',
        transaction_at: '2026-04-12T00:00:00.000Z',
        user_id: 'user-1',
      },
      {
        amount_cents: -9900,
        categories: { name: 'Food' },
        category_id: 'cat-food',
        status: 'confirmed',
        transaction_at: '2026-04-13T00:00:00.000Z',
        user_id: 'user-2',
      },
      {
        amount_cents: -7700,
        categories: { name: 'Food' },
        category_id: 'cat-food',
        status: 'confirmed',
        transaction_at: '2026-05-01T00:00:00.000Z',
        user_id: 'user-1',
      },
      {
        amount_cents: -6600,
        categories: { name: 'Food' },
        category_id: 'cat-food',
        status: 'confirmed',
        transaction_at: '2026-03-31T23:59:59.999Z',
        user_id: 'user-1',
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
        categoryName: 'Food',
        percentage: 64,
        transactionCount: 1,
      },
      {
        amountCents: 1800,
        categoryId: 'cat-transport',
        categoryName: 'Transport',
        percentage: 36,
        transactionCount: 1,
      },
    ]);
  });

  it('uses precomputed monthly summaries and resolves category names by id', async () => {
    queryState.categoriesRows = [{ id: 'cat-food', name: 'Food' }];
    queryState.monthlyRows = [
      {
        category_breakdown: {
          'cat-food': {
            amount_cents: 3000,
            count: 3,
          },
          uncategorized: {
            amount_cents: 1000,
            count: 1,
          },
        },
        month: '2026-04-01',
        total_cents: 4000,
        user_id: 'user-1',
      },
      {
        category_breakdown: {
          'cat-food': {
            amount_cents: 9999,
            count: 1,
          },
        },
        month: '2026-04-01',
        total_cents: 9999,
        user_id: 'user-2',
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
        categoryName: 'Food',
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
        user_id: 'user-1',
      },
    ];
    queryState.transactionRows = [
      {
        amount_cents: -4200,
        categories: { name: 'Food' },
        category_id: 'cat-food',
        status: 'pending_confirmation',
        transaction_at: '2026-04-10T00:00:00.000Z',
        user_id: 'user-1',
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

  it('falls back to live trend points when a precomputed trend row is empty', async () => {
    queryState.monthlyRows = [
      {
        category_breakdown: {},
        month: '2026-03-01',
        total_cents: 0,
        user_id: 'user-1',
      },
      {
        category_breakdown: { 'cat-food': { amount_cents: 2500, count: 2 } },
        month: '2026-04-01',
        total_cents: 2500,
        user_id: 'user-1',
      },
    ];
    queryState.transactionRows = [
      {
        amount_cents: -1000,
        categories: { name: 'Food' },
        category_id: 'cat-food',
        status: 'confirmed',
        transaction_at: '2026-03-10T00:00:00.000Z',
        user_id: 'user-1',
      },
      {
        amount_cents: -9999,
        categories: { name: 'Food' },
        category_id: 'cat-food',
        status: 'confirmed',
        transaction_at: '2026-03-10T00:00:00.000Z',
        user_id: 'user-2',
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
