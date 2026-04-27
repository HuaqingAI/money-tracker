import {
  aggregateMonthlyCategories,
  buildMonthlyComparisons,
  calculatePercentage,
  getUtcMonthRange,
  type Json,
  type MonthlyCategoryInput,
  type MonthlyReportCategory,
  type MonthlyReportSummary,
  type MonthlyTrend,
  type MonthlyTrendPoint,
  shiftMonth,
} from '@money-tracker/shared';

import { getSupabaseAdmin } from '../db/supabase-admin';

interface TransactionSummaryRow {
  amount_cents: number;
  category_id: string | null;
  categories: { name: string } | Array<{ name: string }> | null;
}

interface MonthlySummaryRow {
  category_breakdown: Json;
  month: string;
  total_cents: number;
}

interface CategoryRow {
  id: string;
  name: string;
}

interface CategoryBreakdownValue {
  amount_cents?: unknown;
  amountCents?: unknown;
  category_name?: unknown;
  categoryName?: unknown;
  count?: unknown;
  transaction_count?: unknown;
  transactionCount?: unknown;
}

const UNCATEGORIZED_KEYS = new Set(['__uncategorized__', 'uncategorized', 'other']);

function toMonthDate(month: string): string {
  return `${month}-01`;
}

function toMonthStringFromDate(dateText: string): string {
  return dateText.slice(0, 7);
}

function currentUtcMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function toExpenseCents(value: number): number {
  return Math.abs(value);
}

function getCategoryName(
  categories: TransactionSummaryRow['categories'],
): string | null {
  if (Array.isArray(categories)) {
    return categories[0]?.name ?? null;
  }

  return categories?.name ?? null;
}

function shouldTreatPositiveAmountsAsExpenses(
  rows: TransactionSummaryRow[],
): boolean {
  return rows.every((row) => row.amount_cents >= 0);
}

function getLiveExpenseRows(rows: TransactionSummaryRow[]): MonthlyCategoryInput[] {
  const positiveAmountsAreExpenses = shouldTreatPositiveAmountsAsExpenses(rows);

  return rows
    .map((row) => {
      if (row.amount_cents > 0 && !positiveAmountsAreExpenses) {
        return null;
      }

      const amountCents = toExpenseCents(row.amount_cents);
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

function sumCategoryTransactions(categories: MonthlyReportCategory[]): number {
  return categories.reduce(
    (sum, category) => sum + category.transactionCount,
    0,
  );
}

function parseCategoryBreakdown(
  categoryBreakdown: Json,
  totalCents: number,
  categoryNameById = new Map<string, string>(),
): MonthlyReportCategory[] {
  if (!isObject(categoryBreakdown)) {
    return [];
  }

  const categories: MonthlyReportCategory[] = Object.entries(categoryBreakdown).map(
    ([key, rawValue]) => {
      const value = isObject(rawValue) ? (rawValue as CategoryBreakdownValue) : {};
      const amountCents = toExpenseCents(
        toNumber(value.amount_cents ?? value.amountCents),
      );
      const transactionCount = toNumber(
        value.count ?? value.transaction_count ?? value.transactionCount,
      );
      const rawName = value.category_name ?? value.categoryName;
      const categoryId = UNCATEGORIZED_KEYS.has(key) ? null : key;
      const categoryName =
        typeof rawName === 'string' && rawName.trim()
          ? rawName
          : categoryId
            ? categoryNameById.get(categoryId) ?? '其他'
            : '其他';

      return {
        amountCents,
        categoryId,
        categoryName,
        percentage: calculatePercentage(amountCents, totalCents),
        transactionCount,
      };
    },
  ).filter((category) => category.amountCents > 0);

  return categories.sort(
    (a, b) => b.amountCents - a.amountCents || a.categoryName.localeCompare(b.categoryName),
  );
}

function extractCategoryIds(categoryBreakdown: Json): string[] {
  if (!isObject(categoryBreakdown)) {
    return [];
  }

  return Object.keys(categoryBreakdown).filter(
    (key) => !UNCATEGORIZED_KEYS.has(key),
  );
}

function countTransactionsFromBreakdown(categoryBreakdown: Json): number {
  return parseCategoryBreakdown(categoryBreakdown, 0).reduce(
    (sum, category) => sum + category.transactionCount,
    0,
  );
}

async function fetchCategoryNameById(categoryIds: string[]): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(categoryIds)];
  if (uniqueIds.length === 0) {
    return new Map();
  }

  const { data, error } = await getSupabaseAdmin()
    .schema('billing')
    .from('categories')
    .select('id,name')
    .in('id', uniqueIds);

  if (error) {
    throw new Error(`Failed to load categories: ${error.message}`);
  }

  return new Map(((data ?? []) as CategoryRow[]).map((row) => [row.id, row.name]));
}

async function fetchPrecomputedSummary(
  userId: string,
  month: string,
): Promise<MonthlySummaryRow | null> {
  const { data, error } = await getSupabaseAdmin()
    .schema('analytics')
    .from('monthly_summaries')
    .select('month,total_cents,category_breakdown')
    .eq('user_id', userId)
    .eq('month', toMonthDate(month))
    .single();

  if (error) {
    const errorCode =
      typeof error === 'object' && error !== null && 'code' in error
        ? String(error.code)
        : '';

    if (errorCode === 'PGRST116') {
      return null;
    }

    throw new Error(`Failed to load monthly summary: ${error.message}`);
  }

  return data as MonthlySummaryRow | null;
}

async function fetchLiveTransactionRows(
  userId: string,
  month: string,
): Promise<TransactionSummaryRow[]> {
  const range = getUtcMonthRange(month);
  const { data, error } = await getSupabaseAdmin()
    .schema('billing')
    .from('transactions')
    .select('amount_cents,category_id,categories(name)')
    .eq('user_id', userId)
    .in('status', ['pending_confirmation', 'confirmed'])
    .gte('transaction_at', range.start)
    .lt('transaction_at', range.end);

  if (error) {
    throw new Error(`Failed to load monthly transactions: ${error.message}`);
  }

  return (data ?? []) as TransactionSummaryRow[];
}

function rowsToTrendPoint(month: string, rows: TransactionSummaryRow[]): MonthlyTrendPoint {
  const expenseRows = getLiveExpenseRows(rows);

  return {
    month,
    totalExpenseCents: sumExpenseCents(expenseRows),
    transactionCount: expenseRows.length,
  };
}

function precomputedToTrendPoint(
  month: string,
  row: MonthlySummaryRow,
): MonthlyTrendPoint | null {
  const totalExpenseCents = toExpenseCents(row.total_cents);
  const transactionCount = countTransactionsFromBreakdown(row.category_breakdown);

  if (totalExpenseCents <= 0 && transactionCount <= 0) {
    return null;
  }

  return {
    month,
    totalExpenseCents,
    transactionCount,
  };
}

async function getTrendPoint(userId: string, month: string): Promise<MonthlyTrendPoint> {
  const precomputed = await fetchPrecomputedSummary(userId, month);
  if (precomputed) {
    const point = precomputedToTrendPoint(month, precomputed);
    if (point) {
      return point;
    }
  }

  return rowsToTrendPoint(month, await fetchLiveTransactionRows(userId, month));
}

async function getOptionalTrendPoint(
  userId: string,
  month: string,
): Promise<MonthlyTrendPoint | null> {
  const precomputed = await fetchPrecomputedSummary(userId, month);
  if (precomputed) {
    const point = precomputedToTrendPoint(month, precomputed);
    if (point) {
      return point;
    }
  }

  const rows = await fetchLiveTransactionRows(userId, month);
  const point = rowsToTrendPoint(month, rows);
  if (point.transactionCount === 0 && point.totalExpenseCents === 0) {
    return null;
  }

  return point;
}

export async function getMonthlySummary(
  userId: string,
  month: string,
): Promise<MonthlyReportSummary> {
  const range = getUtcMonthRange(month);
  const precomputed = await fetchPrecomputedSummary(userId, month);
  const [yearOverYearPoint, previousMonthPoint] = await Promise.all([
    getOptionalTrendPoint(userId, shiftMonth(month, -12)),
    getOptionalTrendPoint(userId, shiftMonth(month, -1)),
  ]);

  if (precomputed) {
    const totalExpenseCents = toExpenseCents(precomputed.total_cents);
    const categoryNameById = await fetchCategoryNameById(
      extractCategoryIds(precomputed.category_breakdown),
    );
    const categories = parseCategoryBreakdown(
      precomputed.category_breakdown,
      totalExpenseCents,
      categoryNameById,
    );
    const transactionCount = sumCategoryTransactions(categories);

    if (totalExpenseCents > 0 || transactionCount > 0 || categories.length > 0) {
      return {
        categories,
        comparisons: buildMonthlyComparisons(
          month,
          [
            yearOverYearPoint,
            previousMonthPoint,
            {
              month,
              totalExpenseCents,
              transactionCount,
            },
          ].filter((point): point is MonthlyTrendPoint => point !== null),
        ),
        generatedAt: new Date().toISOString(),
        month,
        monthEnd: range.end,
        monthStart: range.start,
        source: 'precomputed',
        totalExpenseCents,
        transactionCount,
      };
    }
  }

  const rows = await fetchLiveTransactionRows(userId, month);
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

async function fetchPrecomputedTrendPoints(
  userId: string,
  startMonth: string,
  endMonth: string,
): Promise<MonthlyTrendPoint[]> {
  const { data, error } = await getSupabaseAdmin()
    .schema('analytics')
    .from('monthly_summaries')
    .select('month,total_cents,category_breakdown')
    .eq('user_id', userId)
    .gte('month', toMonthDate(startMonth))
    .lte('month', toMonthDate(endMonth))
    .order('month', { ascending: true });

  if (error) {
    throw new Error(`Failed to load monthly trend: ${error.message}`);
  }

  return ((data ?? []) as MonthlySummaryRow[])
    .map((row) => precomputedToTrendPoint(toMonthStringFromDate(row.month), row))
    .filter((point): point is MonthlyTrendPoint => point !== null);
}

export async function getMonthlyTrend(
  userId: string,
  months: number,
  endMonth = currentUtcMonth(),
): Promise<MonthlyTrend> {
  const startMonth = shiftMonth(endMonth, -(months - 1));
  const precomputedPoints = await fetchPrecomputedTrendPoints(
    userId,
    startMonth,
    endMonth,
  );
  const byMonth = new Map(precomputedPoints.map((point) => [point.month, point]));
  const points: MonthlyTrendPoint[] = [];

  for (let offset = 0; offset < months; offset += 1) {
    const month = shiftMonth(startMonth, offset);
    const precomputed = byMonth.get(month);
    points.push(precomputed ?? (await getTrendPoint(userId, month)));
  }

  return {
    endMonth,
    months,
    points,
    startMonth,
  };
}
