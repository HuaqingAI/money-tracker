import {
  aggregateMonthlyCategories,
  BILLING_TRANSACTION_DIRECTIONS,
  BILLING_TRANSACTION_STATUS,
  buildMonthlyComparisons,
  getUtcMonthRange,
  type MonthlyCategoryInput,
  type MonthlyReportSummary,
  type MonthlyTrend,
  type MonthlyTrendPoint,
  shiftMonth,
  type Tables,
} from '@money-tracker/shared';

import { getSupabaseAdmin } from '../db/supabase-admin';

type TransactionSummaryRow = Pick<
  Tables<{ schema: 'billing' }, 'transactions'>,
  'amount_cents' | 'category_id' | 'direction' | 'status'
> & {
  categories: { name: string } | Array<{ name: string }> | null;
};

function currentUtcMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

function getCategoryName(
  categories: TransactionSummaryRow['categories'],
): string | null {
  if (Array.isArray(categories)) {
    return categories[0]?.name ?? null;
  }

  return categories?.name ?? null;
}

function getIncludedStatuses(includePending: boolean): string[] {
  return includePending
    ? [
        BILLING_TRANSACTION_STATUS.confirmed,
        BILLING_TRANSACTION_STATUS.pendingConfirmation,
      ]
    : [BILLING_TRANSACTION_STATUS.confirmed];
}

async function fetchLiveTransactionRows(input: {
  includePending: boolean;
  month: string;
  userId: string;
}): Promise<TransactionSummaryRow[]> {
  const range = getUtcMonthRange(input.month);
  const { data, error } = await getSupabaseAdmin()
    .schema('billing')
    .from('transactions')
    .select('amount_cents,category_id,direction,status,categories(name)')
    .eq('user_id', input.userId)
    .eq('direction', BILLING_TRANSACTION_DIRECTIONS.expense)
    .in('status', getIncludedStatuses(input.includePending))
    .gte('transaction_at', range.start)
    .lt('transaction_at', range.end);

  if (error) {
    throw new Error(`Failed to load monthly transactions: ${error.message}`);
  }

  return (data ?? []) as TransactionSummaryRow[];
}

function getLiveExpenseRows(rows: TransactionSummaryRow[]): MonthlyCategoryInput[] {
  return rows
    .filter((row) => row.direction === BILLING_TRANSACTION_DIRECTIONS.expense)
    .map((row) => {
      const amountCents = Math.abs(row.amount_cents);
      if (amountCents <= 0) {
        return null;
      }

      return {
        amountCents,
        categoryId: row.category_id,
        categoryName: getCategoryName(row.categories),
      };
    })
    .filter((row): row is MonthlyCategoryInput => row !== null);
}

function sumExpenseCents(rows: MonthlyCategoryInput[]): number {
  return rows.reduce((sum, row) => sum + row.amountCents, 0);
}

function rowsToTrendPoint(month: string, rows: TransactionSummaryRow[]): MonthlyTrendPoint {
  const expenseRows = getLiveExpenseRows(rows);

  return {
    month,
    totalExpenseCents: sumExpenseCents(expenseRows),
    transactionCount: expenseRows.length,
  };
}

async function getOptionalTrendPoint(
  userId: string,
  month: string,
): Promise<MonthlyTrendPoint | null> {
  const rows = await fetchLiveTransactionRows({
    includePending: false,
    month,
    userId,
  });
  const point = rowsToTrendPoint(month, rows);
  if (point.transactionCount === 0 && point.totalExpenseCents === 0) {
    return null;
  }

  return point;
}

export async function getMonthlySummary(
  userId: string,
  month: string,
  options: { includePending?: boolean } = {},
): Promise<MonthlyReportSummary> {
  const includePending = options.includePending ?? false;
  const range = getUtcMonthRange(month);
  const [rows, yearOverYearPoint, previousMonthPoint] = await Promise.all([
    fetchLiveTransactionRows({
      includePending,
      month,
      userId,
    }),
    getOptionalTrendPoint(userId, shiftMonth(month, -12)),
    getOptionalTrendPoint(userId, shiftMonth(month, -1)),
  ]);
  const expenseRows = getLiveExpenseRows(rows);
  const categories = aggregateMonthlyCategories(expenseRows);
  const totalExpenseCents = sumExpenseCents(expenseRows);

  return {
    categories,
    comparisons: buildMonthlyComparisons(
      month,
      [
        yearOverYearPoint,
        previousMonthPoint,
        rowsToTrendPoint(month, rows),
      ].filter((point): point is MonthlyTrendPoint => point !== null),
    ),
    generatedAt: new Date().toISOString(),
    month,
    monthEnd: range.end,
    monthStart: range.start,
    source: 'live',
    totalExpenseCents,
    transactionCount: expenseRows.length,
  };
}

export async function getMonthlyTrend(
  userId: string,
  months: number,
  endMonth = currentUtcMonth(),
): Promise<MonthlyTrend> {
  const startMonth = shiftMonth(endMonth, -(months - 1));
  const points: MonthlyTrendPoint[] = [];

  for (let offset = 0; offset < months; offset += 1) {
    const month = shiftMonth(startMonth, offset);
    const rows = await fetchLiveTransactionRows({
      includePending: false,
      month,
      userId,
    });
    points.push(rowsToTrendPoint(month, rows));
  }

  return {
    endMonth,
    months,
    points,
    startMonth,
  };
}
