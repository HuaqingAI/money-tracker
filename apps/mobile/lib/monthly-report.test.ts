import { describe, expect, it, vi } from 'vitest';

import {
  canGoNextMonth,
  formatMonthTitle,
  getAdjacentMonth,
  getCurrentMonth,
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
});
