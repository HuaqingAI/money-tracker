import type {
  MonthlyReportCategory,
  MonthlyReportComparisons,
  MonthlyTrendComparison,
  MonthlyTrendPoint,
  TrendDirection,
} from '../types/analytics';

export interface MonthlyCategoryInput {
  amountCents: number;
  categoryId: string | null;
  categoryName: string | null;
}

export interface UtcMonthRange {
  end: string;
  start: string;
}

function parseMonth(month: string): { monthIndex: number; year: number } {
  const [yearText, monthText] = month.split('-');
  const year = Number(yearText);
  const monthNumber = Number(monthText);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(monthNumber) ||
    monthNumber < 1 ||
    monthNumber > 12
  ) {
    throw new Error('month must use YYYY-MM format');
  }

  return {
    monthIndex: monthNumber - 1,
    year,
  };
}

function toMonthString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getUtcMonthRange(month: string): UtcMonthRange {
  const parsed = parseMonth(month);
  const start = new Date(Date.UTC(parsed.year, parsed.monthIndex, 1));
  const end = new Date(Date.UTC(parsed.year, parsed.monthIndex + 1, 1));

  return {
    end: end.toISOString(),
    start: start.toISOString(),
  };
}

export function shiftMonth(month: string, offset: number): string {
  const parsed = parseMonth(month);
  return toMonthString(
    new Date(Date.UTC(parsed.year, parsed.monthIndex + offset, 1)),
  );
}

export function calculatePercentage(amountCents: number, totalCents: number): number {
  if (totalCents <= 0) {
    return 0;
  }

  return Math.round((amountCents / totalCents) * 1000) / 10;
}

function normalizeCategoryKey(input: MonthlyCategoryInput): string {
  return input.categoryId ?? '__uncategorized__';
}

export function aggregateMonthlyCategories(
  rows: MonthlyCategoryInput[],
): MonthlyReportCategory[] {
  const grouped = new Map<
    string,
    {
      amountCents: number;
      categoryId: string | null;
      categoryName: string;
      transactionCount: number;
    }
  >();

  for (const row of rows) {
    const key = normalizeCategoryKey(row);
    const existing = grouped.get(key);

    if (existing) {
      existing.amountCents += row.amountCents;
      existing.transactionCount += 1;
      continue;
    }

    grouped.set(key, {
      amountCents: row.amountCents,
      categoryId: row.categoryId,
      categoryName: row.categoryName?.trim() || '其他',
      transactionCount: 1,
    });
  }

  const totalCents = Array.from(grouped.values()).reduce(
    (sum, row) => sum + row.amountCents,
    0,
  );

  return Array.from(grouped.values())
    .map((row) => ({
      ...row,
      percentage: calculatePercentage(row.amountCents, totalCents),
    }))
    .sort((a, b) => b.amountCents - a.amountCents || a.categoryName.localeCompare(b.categoryName));
}

function resolveTrendDirection(differenceCents: number): TrendDirection {
  if (differenceCents > 0) {
    return 'up';
  }

  if (differenceCents < 0) {
    return 'down';
  }

  return 'flat';
}

function buildComparison(
  current: MonthlyTrendPoint | undefined,
  baseline: MonthlyTrendPoint | undefined,
): MonthlyTrendComparison | null {
  if (!current || !baseline) {
    return null;
  }

  const differenceCents = current.totalExpenseCents - baseline.totalExpenseCents;
  const percentageChange =
    baseline.totalExpenseCents === 0
      ? null
      : Math.round((differenceCents / baseline.totalExpenseCents) * 1000) / 10;

  return {
    baselineMonth: baseline.month,
    currentMonth: current.month,
    differenceCents,
    direction: resolveTrendDirection(differenceCents),
    percentageChange,
  };
}

export function buildMonthlyComparisons(
  currentMonth: string,
  points: MonthlyTrendPoint[],
): MonthlyReportComparisons {
  const byMonth = new Map(points.map((point) => [point.month, point]));
  const current = byMonth.get(currentMonth);

  return {
    previousMonth: buildComparison(current, byMonth.get(shiftMonth(currentMonth, -1))),
    yearOverYear: buildComparison(current, byMonth.get(shiftMonth(currentMonth, -12))),
  };
}
