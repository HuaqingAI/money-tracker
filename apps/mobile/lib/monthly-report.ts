import { shiftMonth } from '@money-tracker/shared';

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
