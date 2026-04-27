import {
  type MonthlyReportSummary,
  shiftMonth,
} from '@money-tracker/shared';

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function getAdjacentMonth(month: string, direction: 'next' | 'previous'): string {
  return shiftMonth(month, direction === 'next' ? 1 : -1);
}

export function formatMonthTitle(month: string): string {
  const [year, monthNumber] = month.split('-');
  return `${year}年${Number(monthNumber)}月`;
}

export function canGoNextMonth(month: string, nowMonth = getCurrentMonth()): boolean {
  return month < nowMonth;
}

export function hasMonthlyReportData(
  summary: MonthlyReportSummary | undefined,
): boolean {
  return (
    (summary?.transactionCount ?? 0) > 0 ||
    Math.abs(summary?.totalExpenseCents ?? 0) > 0 ||
    (summary?.categories.length ?? 0) > 0
  );
}
