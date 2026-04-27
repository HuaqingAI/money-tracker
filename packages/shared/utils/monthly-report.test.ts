import { describe, expect, it } from 'vitest';

import {
  aggregateMonthlyCategories,
  buildMonthlyComparisons,
  calculatePercentage,
  getUtcMonthRange,
  shiftMonth,
} from './monthly-report';

describe('monthly-report utils', () => {
  it('calculates UTC month ranges across year boundaries', () => {
    expect(getUtcMonthRange('2026-01')).toEqual({
      end: '2026-02-01T00:00:00.000Z',
      start: '2026-01-01T00:00:00.000Z',
    });
    expect(getUtcMonthRange('2026-12')).toEqual({
      end: '2027-01-01T00:00:00.000Z',
      start: '2026-12-01T00:00:00.000Z',
    });
  });

  it('shifts YYYY-MM values by whole months', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(shiftMonth('2026-04', -12)).toBe('2025-04');
  });

  it('calculates rounded percentages with zero guard', () => {
    expect(calculatePercentage(1250, 5000)).toBe(25);
    expect(calculatePercentage(1, 3)).toBe(33.3);
    expect(calculatePercentage(1, 0)).toBe(0);
  });

  it('aggregates confirmed monthly categories and keeps uncategorized as other', () => {
    const categories = aggregateMonthlyCategories([
      {
        amountCents: 1200,
        categoryId: 'cat-food',
        categoryName: '餐饮',
      },
      {
        amountCents: 800,
        categoryId: 'cat-food',
        categoryName: '餐饮',
      },
      {
        amountCents: 500,
        categoryId: null,
        categoryName: null,
      },
    ]);

    expect(categories).toEqual([
      {
        amountCents: 2000,
        categoryId: 'cat-food',
        categoryName: '餐饮',
        percentage: 80,
        transactionCount: 2,
      },
      {
        amountCents: 500,
        categoryId: null,
        categoryName: '其他',
        percentage: 20,
        transactionCount: 1,
      },
    ]);
  });

  it('builds month-over-month and year-over-year comparisons', () => {
    const comparisons = buildMonthlyComparisons('2026-04', [
      { month: '2025-04', totalExpenseCents: 7000, transactionCount: 5 },
      { month: '2026-03', totalExpenseCents: 8000, transactionCount: 6 },
      { month: '2026-04', totalExpenseCents: 10000, transactionCount: 7 },
    ]);

    expect(comparisons.previousMonth).toEqual({
      baselineMonth: '2026-03',
      currentMonth: '2026-04',
      differenceCents: 2000,
      direction: 'up',
      percentageChange: 25,
    });
    expect(comparisons.yearOverYear).toEqual({
      baselineMonth: '2025-04',
      currentMonth: '2026-04',
      differenceCents: 3000,
      direction: 'up',
      percentageChange: 42.9,
    });
  });

  it('returns null comparisons when the baseline month is missing or zero', () => {
    const missing = buildMonthlyComparisons('2026-04', [
      { month: '2026-04', totalExpenseCents: 10000, transactionCount: 7 },
    ]);
    const zero = buildMonthlyComparisons('2026-04', [
      { month: '2026-03', totalExpenseCents: 0, transactionCount: 0 },
      { month: '2026-04', totalExpenseCents: 10000, transactionCount: 7 },
    ]);

    expect(missing.previousMonth).toBeNull();
    expect(missing.yearOverYear).toBeNull();
    expect(zero.previousMonth).toEqual({
      baselineMonth: '2026-03',
      currentMonth: '2026-04',
      differenceCents: 10000,
      direction: 'up',
      percentageChange: null,
    });
  });
});
