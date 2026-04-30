import type {
  DASHBOARD_ERROR_CODES,
  DASHBOARD_ROUTE_PATHS,
} from '../constants/dashboard';
import type {
  BillingDirectionConfidence,
  BillingTransactionDirection,
  BillingTransactionStatus,
} from './billing';

export type DashboardRoutePath =
  (typeof DASHBOARD_ROUTE_PATHS)[keyof typeof DASHBOARD_ROUTE_PATHS];

export type DashboardErrorCode =
  (typeof DASHBOARD_ERROR_CODES)[keyof typeof DASHBOARD_ERROR_CODES];

export interface CategorySummary {
  amountCents: number;
  categoryId: string | null;
  color: string;
  icon: string;
  name: string;
  percentage: number;
  transactionCount: number;
}

export interface DashboardSpotlight {
  contextKey: string;
  text: string;
}

export interface MonthlySummary {
  aiCoverageRate: number;
  aiCoveredCount: number;
  categoryBreakdown: CategorySummary[];
  hasTransactions: boolean;
  month: string;
  pendingConfirmationCount: number;
  pendingConfirmationExpenseCents: number;
  spotlight: DashboardSpotlight | null;
  totalExpenseCents: number;
  transactionCount: number;
}

export interface RecentTransaction {
  amountCents: number;
  categoryId: string | null;
  categoryName: string;
  description: string | null;
  direction: BillingTransactionDirection;
  directionConfidence: BillingDirectionConfidence;
  id: string;
  merchant: string | null;
  source: string | null;
  status: BillingTransactionStatus;
  transactionAt: string;
}

export interface RecentTransactionsResult {
  hasMore: boolean;
  limit: number;
  transactions: RecentTransaction[];
}

