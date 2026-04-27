export type MonthlyReportSource = 'live' | 'precomputed';

export type TrendDirection = 'down' | 'flat' | 'up';

export interface MonthlyReportCategory {
  amountCents: number;
  categoryId: string | null;
  categoryName: string;
  percentage: number;
  transactionCount: number;
}

export interface MonthlyTrendPoint {
  month: string;
  totalExpenseCents: number;
  transactionCount: number;
}

export interface MonthlyTrendComparison {
  baselineMonth: string;
  currentMonth: string;
  differenceCents: number;
  direction: TrendDirection;
  percentageChange: number | null;
}

export interface MonthlyReportComparisons {
  previousMonth: MonthlyTrendComparison | null;
  yearOverYear: MonthlyTrendComparison | null;
}

export interface MonthlyReportSummary {
  categories: MonthlyReportCategory[];
  comparisons: MonthlyReportComparisons;
  generatedAt: string;
  month: string;
  monthEnd: string;
  monthStart: string;
  source: MonthlyReportSource;
  totalExpenseCents: number;
  transactionCount: number;
}

export interface MonthlyTrend {
  endMonth: string;
  months: number;
  points: MonthlyTrendPoint[];
  startMonth: string;
}
