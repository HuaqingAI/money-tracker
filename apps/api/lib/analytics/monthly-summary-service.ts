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
  'amount_cents' | 'category_id' | 'direction' | 'status' | 'transaction_at'
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
  return fetchLiveTransactionRowsInRange({
    endIso: range.end,
    includePending: input.includePending,
    startIso: range.start,
    userId: input.userId,
  });
}

async function fetchLiveTransactionRowsInRange(input: {
  endIso: string;
  includePending: boolean;
  startIso: string;
  userId: string;
}): Promise<TransactionSummaryRow[]> {
  const { data, error } = await getSupabaseAdmin()
    .schema('billing')
    .from('transactions')
    .select('amount_cents,category_id,direction,status,transaction_at,categories(name)')
    .eq('user_id', input.userId)
    .eq('direction', BILLING_TRANSACTION_DIRECTIONS.expense)
    .in('status', getIncludedStatuses(input.includePending))
    .gte('transaction_at', input.startIso)
    .lt('transaction_at', input.endIso);

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
  includePending: boolean,
): Promise<MonthlyTrendPoint | null> {
  const rows = await fetchLiveTransactionRows({
    includePending,
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
    getOptionalTrendPoint(userId, shiftMonth(month, -12), includePending),
    getOptionalTrendPoint(userId, shiftMonth(month, -1), includePending),
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
  const startRange = getUtcMonthRange(startMonth);
  const endRange = getUtcMonthRange(shiftMonth(endMonth, 1));
  const rows = await fetchLiveTransactionRowsInRange({
    endIso: endRange.start,
    includePending: false,
    startIso: startRange.start,
    userId,
  });
  const rowsByMonth = new Map<string, TransactionSummaryRow[]>();

  for (const row of rows) {
    const transactionAt = new Date(row.transaction_at);
    if (Number.isNaN(transactionAt.getTime())) {
      continue;
    }

    const rowMonth = `${transactionAt.getUTCFullYear()}-${String(
      transactionAt.getUTCMonth() + 1,
    ).padStart(2, '0')}`;
    rowsByMonth.set(rowMonth, [...(rowsByMonth.get(rowMonth) ?? []), row]);
  }

  const points = Array.from({ length: months }, (_, offset) => {
    const month = shiftMonth(startMonth, offset);
    return rowsToTrendPoint(month, rowsByMonth.get(month) ?? []);
  });

  return {
    endMonth,
    months,
    points,
    startMonth,
  };
}
