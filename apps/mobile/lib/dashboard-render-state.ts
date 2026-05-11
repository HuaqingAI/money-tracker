import { type MonthlySummary, type RecentTransaction } from '@money-tracker/shared';

export type DashboardQueryStatus = 'error' | 'loading' | 'success';

export interface DashboardRenderStateInput {
  recentTransactionsStatus: DashboardQueryStatus;
  summary?: MonthlySummary;
  summaryStatus: DashboardQueryStatus;
  transactions: RecentTransaction[];
}

export interface DashboardRenderState {
  showEmptyState: boolean;
  showPageError: boolean;
  showPageSkeleton: boolean;
  showRecentError: boolean;
  showRecentLoading: boolean;
  showRecentTransactions: boolean;
  showSummaryContent: boolean;
  showSummaryError: boolean;
  showSummaryLoading: boolean;
}

export function getDashboardRenderState(
  input: DashboardRenderStateInput,
): DashboardRenderState {
  const hasSummary = input.summary !== undefined;
  const hasRecentTransactions = input.transactions.length > 0;
  const hasRenderableData = hasSummary || hasRecentTransactions;
  const hasError =
    input.summaryStatus === 'error' || input.recentTransactionsStatus === 'error';

  const showPageSkeleton =
    !hasRenderableData &&
    !hasError &&
    (input.summaryStatus === 'loading' ||
      input.recentTransactionsStatus === 'loading');
  const showPageError = !hasRenderableData && hasError;

  return {
    showEmptyState: hasSummary && input.summary?.hasTransactions === false,
    showPageError,
    showPageSkeleton,
    showRecentError:
      !showPageError &&
      !hasRecentTransactions &&
      input.recentTransactionsStatus === 'error',
    showRecentLoading:
      !showPageSkeleton &&
      !showPageError &&
      !hasRecentTransactions &&
      input.recentTransactionsStatus === 'loading',
    showRecentTransactions: hasRecentTransactions,
    showSummaryContent: hasSummary && input.summary?.hasTransactions === true,
    showSummaryError:
      !showPageError && !hasSummary && input.summaryStatus === 'error',
    showSummaryLoading:
      !showPageSkeleton &&
      !showPageError &&
      !hasSummary &&
      input.summaryStatus === 'loading',
  };
}
