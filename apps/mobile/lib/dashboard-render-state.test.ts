import { describe, expect, it } from 'vitest';

import { getDashboardRenderState } from './dashboard-render-state';

const monthlySummary = {
  aiCoverageRate: 100,
  aiCoveredCount: 1,
  categoryBreakdown: [],
  hasTransactions: true,
  month: '2026-04',
  pendingConfirmationCount: 0,
  pendingConfirmationExpenseCents: 0,
  spotlight: null,
  totalExpenseCents: 1200,
  transactionCount: 1,
};

const transaction = {
  amountCents: -1200,
  categoryId: null,
  categoryName: '餐饮',
  description: null,
  direction: 'expense' as const,
  directionConfidence: 'high' as const,
  id: '11111111-1111-4111-8111-111111111111',
  merchant: '咖啡店',
  source: 'alipay_csv' as const,
  status: 'confirmed' as const,
  transactionAt: '2026-04-27T01:20:00.000Z',
};

describe('dashboard render state', () => {
  it('keeps summary content visible when recent transactions fail', () => {
    expect(
      getDashboardRenderState({
        recentTransactionsStatus: 'error',
        summary: monthlySummary,
        summaryStatus: 'success',
        transactions: [],
      }),
    ).toMatchObject({
      showPageError: false,
      showRecentError: true,
      showSummaryContent: true,
    });
  });

  it('keeps recent transactions visible when summary fails', () => {
    expect(
      getDashboardRenderState({
        recentTransactionsStatus: 'success',
        summaryStatus: 'error',
        transactions: [transaction],
      }),
    ).toMatchObject({
      showPageError: false,
      showRecentTransactions: true,
      showSummaryError: true,
    });
  });

  it('only shows the page error fallback when no core data is renderable', () => {
    expect(
      getDashboardRenderState({
        recentTransactionsStatus: 'error',
        summaryStatus: 'error',
        transactions: [],
      }),
    ).toMatchObject({
      showPageError: true,
      showRecentError: false,
      showSummaryError: false,
    });
  });
});
