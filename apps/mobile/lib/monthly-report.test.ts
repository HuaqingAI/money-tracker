import type { MonthlyReportSummary } from '@money-tracker/shared';
import { describe, expect, it, vi } from 'vitest';

import {
  canGoNextMonth,
  formatMonthTitle,
  getAdjacentMonth,
  getCurrentMonth,
  hasMonthlyReportData,
} from './monthly-report';

describe('mobile monthly-report helpers', () => {
  it('formats month titles for Chinese UI', () => {
    expect(formatMonthTitle('2026-04')).toBe('2026年4月');
  });

  it('moves across month and year boundaries', () => {
    expect(getAdjacentMonth('2026-01', 'previous')).toBe('2025-12');
    expect(getAdjacentMonth('2026-12', 'next')).toBe('2027-01');
  });

  it('prevents moving past the current UTC month', () => {
    expect(canGoNextMonth('2026-03', '2026-04')).toBe(true);
    expect(canGoNextMonth('2026-04', '2026-04')).toBe(false);
  });

  it('gets current month in UTC', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-30T23:30:00.000Z'));

    expect(getCurrentMonth()).toBe('2026-04');

    vi.useRealTimers();
  });

  it('treats non-zero totals as report data even when transaction counts are missing', () => {
    const summary: MonthlyReportSummary = {
      categories: [],
      comparisons: {
        previousMonth: null,
        yearOverYear: null,
      },
      generatedAt: '2026-04-27T00:00:00.000Z',
      month: '2026-04',
      monthEnd: '2026-05-01T00:00:00.000Z',
      monthStart: '2026-04-01T00:00:00.000Z',
      source: 'precomputed',
      totalExpenseCents: 1200,
      transactionCount: 0,
    };

    expect(hasMonthlyReportData(summary)).toBe(true);
    expect(hasMonthlyReportData(undefined)).toBe(false);
  });
});
