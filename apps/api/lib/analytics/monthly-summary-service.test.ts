import { beforeEach, describe, expect, it, vi } from 'vitest';

interface TransactionFixtureRow {
  amount_cents: number;
  category_id: string | null;
  categories: { name: string } | null;
  direction: 'closed' | 'expense' | 'income' | 'refund';
  status: 'confirmed' | 'pending_confirmation' | 'rejected';
  transaction_at: string;
  user_id: string;
}

const queryState = vi.hoisted(() => ({
  executedQueries: [] as Array<{
    eqFilters: Array<[string, unknown]>;
    gteFilters: Array<[string, string]>;
    inFilters: Array<[string, string[]]>;
    ltFilters: Array<[string, string]>;
  }>,
  transactionRows: [] as TransactionFixtureRow[],
}));

const getSupabaseAdminMock = vi.hoisted(() =>
  vi.fn(() => {
    const createQuery = () => {
      const eqFilters = new Map<string, unknown>();
      const gteFilters = new Map<string, string>();
      const inFilters = new Map<string, string[]>();
      const ltFilters = new Map<string, string>();

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

        return true;
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
        lt: vi.fn((column: string, value: string) => {
          ltFilters.set(column, value);
          return query;
        }),
        select: vi.fn(() => query),
        then: (
          resolve: (value: { data: unknown; error: null }) => void,
          reject: (reason?: unknown) => void,
        ) => {
          queryState.executedQueries.push({
            eqFilters: [...eqFilters.entries()],
            gteFilters: [...gteFilters.entries()],
            inFilters: [...inFilters.entries()],
            ltFilters: [...ltFilters.entries()],
          });
          return Promise.resolve({
            data: queryState.transactionRows.filter(matchesFilters),
            error: null,
          }).then(resolve, reject);
        },
      };

      return query;
    };

    return {
      schema: vi.fn(() => ({
        from: vi.fn(() => createQuery()),
      })),
    };
  }),
);

vi.mock('../db/supabase-admin', () => ({
  getSupabaseAdmin: getSupabaseAdminMock,
}));

import { getMonthlySummary, getMonthlyTrend } from './monthly-summary-service';

describe('monthly-summary-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryState.executedQueries = [];
    queryState.transactionRows = [];
  });

  it('defaults to confirmed expense and excludes pending income refund closed and rejected rows', async () => {
    queryState.transactionRows = [
      {
        amount_cents: -1800,
        categories: { name: 'Transport' },
        category_id: 'cat-transport',
        direction: 'expense',
        status: 'confirmed',
        transaction_at: '2026-04-11T00:00:00.000Z',
        user_id: 'user-1',
      },
      {
        amount_cents: -3200,
        categories: { name: 'Food' },
        category_id: 'cat-food',
        direction: 'expense',
        status: 'pending_confirmation',
        transaction_at: '2026-04-10T00:00:00.000Z',
        user_id: 'user-1',
      },
      {
        amount_cents: 300000,
        categories: { name: 'Income' },
        category_id: 'cat-income',
        direction: 'income',
        status: 'confirmed',
        transaction_at: '2026-04-12T00:00:00.000Z',
        user_id: 'user-1',
      },
      {
        amount_cents: 900,
        categories: { name: 'Refund' },
        category_id: 'cat-refund',
        direction: 'refund',
        status: 'confirmed',
        transaction_at: '2026-04-13T00:00:00.000Z',
        user_id: 'user-1',
      },
      {
        amount_cents: -700,
        categories: { name: 'Other' },
        category_id: null,
        direction: 'expense',
        status: 'rejected',
        transaction_at: '2026-04-14T00:00:00.000Z',
        user_id: 'user-1',
      },
      {
        amount_cents: -9900,
        categories: { name: 'Food' },
        category_id: 'cat-food',
        direction: 'expense',
        status: 'confirmed',
        transaction_at: '2026-04-15T00:00:00.000Z',
        user_id: 'user-2',
      },
    ];

    const summary = await getMonthlySummary('user-1', '2026-04');

    expect(summary.source).toBe('live');
    expect(summary.month).toBe('2026-04');
    expect(summary.monthStart).toBe('2026-04-01T00:00:00.000Z');
    expect(summary.monthEnd).toBe('2026-05-01T00:00:00.000Z');
    expect(summary.totalExpenseCents).toBe(1800);
    expect(summary.transactionCount).toBe(1);
    expect(summary.categories).toEqual([
      {
        amountCents: 1800,
        categoryId: 'cat-transport',
        categoryName: 'Transport',
        percentage: 100,
        transactionCount: 1,
      },
    ]);
  });

  it('includes pending expense only when includePending is true', async () => {
    queryState.transactionRows = [
      {
        amount_cents: -1800,
        categories: { name: 'Transport' },
        category_id: 'cat-transport',
        direction: 'expense',
        status: 'confirmed',
        transaction_at: '2026-04-11T00:00:00.000Z',
        user_id: 'user-1',
      },
      {
        amount_cents: -3200,
        categories: { name: 'Food' },
        category_id: 'cat-food',
        direction: 'expense',
        status: 'pending_confirmation',
        transaction_at: '2026-04-10T00:00:00.000Z',
        user_id: 'user-1',
      },
    ];

    const summary = await getMonthlySummary('user-1', '2026-04', {
      includePending: true,
    });

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

  it('uses the same includePending scope for monthly comparisons', async () => {
    queryState.transactionRows = [
      {
        amount_cents: -1000,
        categories: { name: 'Food' },
        category_id: 'cat-food',
        direction: 'expense',
        status: 'confirmed',
        transaction_at: '2026-04-10T00:00:00.000Z',
        user_id: 'user-1',
      },
      {
        amount_cents: -2000,
        categories: { name: 'Food' },
        category_id: 'cat-food',
        direction: 'expense',
        status: 'pending_confirmation',
        transaction_at: '2026-04-11T00:00:00.000Z',
        user_id: 'user-1',
      },
      {
        amount_cents: -500,
        categories: { name: 'Food' },
        category_id: 'cat-food',
        direction: 'expense',
        status: 'confirmed',
        transaction_at: '2026-03-10T00:00:00.000Z',
        user_id: 'user-1',
      },
      {
        amount_cents: -1500,
        categories: { name: 'Food' },
        category_id: 'cat-food',
        direction: 'expense',
        status: 'pending_confirmation',
        transaction_at: '2026-03-11T00:00:00.000Z',
        user_id: 'user-1',
      },
    ];

    const summary = await getMonthlySummary('user-1', '2026-04', {
      includePending: true,
    });

    expect(summary.totalExpenseCents).toBe(3000);
    expect(summary.comparisons.previousMonth).toEqual({
      baselineMonth: '2026-03',
      currentMonth: '2026-04',
      differenceCents: 1000,
      direction: 'up',
      percentageChange: 50,
    });
    expect(
      queryState.executedQueries.every((query) =>
        query.inFilters.some(
          ([column, values]) =>
            column === 'status' &&
            values.includes('confirmed') &&
            values.includes('pending_confirmation'),
        ),
      ),
    ).toBe(true);
  });

  it('uses confirmed expense only for trend points', async () => {
    queryState.transactionRows = [
      {
        amount_cents: -1000,
        categories: { name: 'Food' },
        category_id: 'cat-food',
        direction: 'expense',
        status: 'confirmed',
        transaction_at: '2026-03-10T00:00:00.000Z',
        user_id: 'user-1',
      },
      {
        amount_cents: -5000,
        categories: { name: 'Food' },
        category_id: 'cat-food',
        direction: 'expense',
        status: 'pending_confirmation',
        transaction_at: '2026-03-11T00:00:00.000Z',
        user_id: 'user-1',
      },
      {
        amount_cents: -2500,
        categories: { name: 'Food' },
        category_id: 'cat-food',
        direction: 'expense',
        status: 'confirmed',
        transaction_at: '2026-04-10T00:00:00.000Z',
        user_id: 'user-1',
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
          transactionCount: 1,
        },
      ],
      startMonth: '2026-03',
    });
    expect(queryState.executedQueries).toHaveLength(1);
    expect(queryState.executedQueries[0]?.gteFilters).toContainEqual([
      'transaction_at',
      '2026-03-01T00:00:00.000Z',
    ]);
    expect(queryState.executedQueries[0]?.ltFilters).toContainEqual([
      'transaction_at',
      '2026-05-01T00:00:00.000Z',
    ]);
  });
});
