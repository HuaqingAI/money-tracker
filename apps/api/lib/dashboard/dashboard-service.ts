import {
  type CategorySummary,
  DASHBOARD_CATEGORY_DISPLAY,
  type DashboardSpotlight,
  formatAmountCents,
  type Json,
  type MonthlySummary,
  monthlySummarySchema,
  type Tables,
} from '@money-tracker/shared';

import { getSupabaseAdmin } from '../db/supabase-admin';

type TransactionRow = Pick<
  Tables<{ schema: 'billing' }, 'transactions'>,
  | 'amount_cents'
  | 'category_id'
  | 'description'
  | 'merchant'
  | 'source'
  | 'status'
  | 'transaction_at'
>;

type CategoryRow = Pick<
  Tables<{ schema: 'billing' }, 'categories'>,
  'icon' | 'id' | 'name'
>;

type MonthlySummaryRow = Pick<
  Tables<{ schema: 'analytics' }, 'monthly_summaries'>,
  'category_breakdown' | 'month' | 'total_cents'
>;

interface CategoryBreakdownEntry {
  amountCents: number;
  categoryId: string | null;
  transactionCount: number;
}

export interface DashboardRepository {
  getMonthlySummaryRow(input: {
    month: string;
    userId: string;
  }): Promise<MonthlySummaryRow | null>;
  listCategories(categoryIds: string[]): Promise<CategoryRow[]>;
  listMonthTransactions(input: {
    endIso: string;
    startIso: string;
    userId: string;
  }): Promise<TransactionRow[]>;
}

export class SupabaseDashboardRepository implements DashboardRepository {
  async getMonthlySummaryRow(input: {
    month: string;
    userId: string;
  }): Promise<MonthlySummaryRow | null> {
    const { data, error } = await getSupabaseAdmin()
      .schema('analytics')
      .from('monthly_summaries')
      .select('category_breakdown, month, total_cents')
      .eq('user_id', input.userId)
      .eq('month', `${input.month}-01`)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load monthly summary: ${error.message}`);
    }

    return data;
  }

  async listCategories(categoryIds: string[]): Promise<CategoryRow[]> {
    if (categoryIds.length === 0) {
      return [];
    }

    const { data, error } = await getSupabaseAdmin()
      .schema('billing')
      .from('categories')
      .select('id, name, icon')
      .in('id', categoryIds);

    if (error) {
      throw new Error(`Failed to load categories: ${error.message}`);
    }

    return data ?? [];
  }

  async listMonthTransactions(input: {
    endIso: string;
    startIso: string;
    userId: string;
  }): Promise<TransactionRow[]> {
    const { data, error } = await getSupabaseAdmin()
      .schema('billing')
      .from('transactions')
      .select(
        'amount_cents, category_id, description, merchant, source, status, transaction_at',
      )
      .eq('user_id', input.userId)
      .gte('transaction_at', input.startIso)
      .lt('transaction_at', input.endIso)
      .in('status', ['pending_confirmation', 'confirmed']);

    if (error) {
      throw new Error(`Failed to load dashboard transactions: ${error.message}`);
    }

    return data ?? [];
  }
}

function getMonthBounds(month: string): { endIso: string; startIso: string } {
  const [yearText, monthText] = month.split('-');
  const year = Number.parseInt(yearText ?? '', 10);
  const monthIndex = Number.parseInt(monthText ?? '', 10) - 1;
  const start = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0));

  return {
    endIso: end.toISOString(),
    startIso: start.toISOString(),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readNumberField(record: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }

  return 0;
}

function parseMonthlySummaryBreakdown(
  breakdown: Json,
): CategoryBreakdownEntry[] {
  if (!isRecord(breakdown)) {
    return [];
  }

  return Object.entries(breakdown)
    .map(([categoryId, rawValue]) => {
      if (!isRecord(rawValue)) {
        return null;
      }

      const amountCents = readNumberField(rawValue, [
        'amountCents',
        'amount_cents',
      ]);
      const transactionCount = readNumberField(rawValue, ['count', 'transactionCount']);

      if (amountCents <= 0) {
        return null;
      }

      return {
        amountCents,
        categoryId: categoryId === 'uncategorized' ? null : categoryId,
        transactionCount,
      };
    })
    .filter((entry): entry is CategoryBreakdownEntry => entry !== null);
}

function shouldTreatPositiveAmountsAsExpenses(transactions: TransactionRow[]): boolean {
  return transactions.every((transaction) => transaction.amount_cents >= 0);
}

function getExpenseCents(
  transaction: TransactionRow,
  positiveAmountsAreExpenses: boolean,
): number {
  if (transaction.amount_cents < 0) {
    return Math.abs(transaction.amount_cents);
  }

  return positiveAmountsAreExpenses ? transaction.amount_cents : 0;
}

function aggregateTransactions(transactions: TransactionRow[]): {
  entries: CategoryBreakdownEntry[];
  totalExpenseCents: number;
} {
  const positiveAmountsAreExpenses = shouldTreatPositiveAmountsAsExpenses(transactions);
  const byCategory = new Map<string, CategoryBreakdownEntry>();
  let totalExpenseCents = 0;

  for (const transaction of transactions) {
    const amountCents = getExpenseCents(transaction, positiveAmountsAreExpenses);
    if (amountCents <= 0) {
      continue;
    }

    const key = transaction.category_id ?? 'uncategorized';
    const existing = byCategory.get(key) ?? {
      amountCents: 0,
      categoryId: transaction.category_id,
      transactionCount: 0,
    };

    existing.amountCents += amountCents;
    existing.transactionCount += 1;
    byCategory.set(key, existing);
    totalExpenseCents += amountCents;
  }

  return {
    entries: [...byCategory.values()],
    totalExpenseCents,
  };
}

function findCategoryDisplay(name: string | null): {
  color: string;
  icon: string;
  name: string;
} {
  if (!name) {
    return DASHBOARD_CATEGORY_DISPLAY.other;
  }

  const matched = Object.values(DASHBOARD_CATEGORY_DISPLAY).find((display) =>
    display.keywords.some((keyword) => name.includes(keyword)),
  );

  return matched ?? {
    ...DASHBOARD_CATEGORY_DISPLAY.other,
    name,
  };
}

function buildCategorySummaries(input: {
  categories: CategoryRow[];
  entries: CategoryBreakdownEntry[];
  totalExpenseCents: number;
}): CategorySummary[] {
  const categoryById = new Map(input.categories.map((category) => [category.id, category]));

  return input.entries
    .map((entry) => {
      const category = entry.categoryId ? categoryById.get(entry.categoryId) : null;
      const display = findCategoryDisplay(category?.name ?? null);
      const percentage =
        input.totalExpenseCents > 0
          ? Math.round((entry.amountCents / input.totalExpenseCents) * 1000) / 10
          : 0;

      return {
        amountCents: entry.amountCents,
        categoryId: entry.categoryId,
        color: display.color,
        icon: category?.icon ?? display.icon,
        name: category?.name ?? display.name,
        percentage,
        transactionCount: entry.transactionCount,
      };
    })
    .sort((left, right) => right.amountCents - left.amountCents)
    .slice(0, 5);
}

function createSpotlight(input: {
  categoryBreakdown: CategorySummary[];
  pendingConfirmationCount: number;
  transactionCount: number;
}): DashboardSpotlight | null {
  if (input.transactionCount === 0) {
    return null;
  }

  if (input.pendingConfirmationCount > 0) {
    return {
      contextKey: 'pending-confirmation',
      text: `有 ${input.pendingConfirmationCount} 笔交易待确认，处理后分类会更清楚。`,
    };
  }

  const topCategory = input.categoryBreakdown[0];
  if (topCategory) {
    return {
      contextKey: 'top-category',
      text: `本月${topCategory.name}支出最多，共 ${formatAmountCents(topCategory.amountCents)}。`,
    };
  }

  return {
    contextKey: 'learning',
    text: '部分交易还在学习中，后续会越来越准。',
  };
}

export class DashboardService {
  constructor(
    private readonly repository: DashboardRepository =
      new SupabaseDashboardRepository(),
  ) {}

  async getMonthlySummary(input: {
    month: string;
    userId: string;
  }): Promise<MonthlySummary> {
    const bounds = getMonthBounds(input.month);
    const [summaryRow, transactions] = await Promise.all([
      this.repository.getMonthlySummaryRow(input),
      this.repository.listMonthTransactions({
        ...bounds,
        userId: input.userId,
      }),
    ]);
    const realtime = aggregateTransactions(transactions);
    const summaryEntries = summaryRow
      ? parseMonthlySummaryBreakdown(summaryRow.category_breakdown)
      : [];
    const useSummaryRow =
      summaryEntries.length > 0 && Number(summaryRow?.total_cents ?? 0) > 0;
    const entries = useSummaryRow ? summaryEntries : realtime.entries;
    const totalExpenseCents = useSummaryRow
      ? Number(summaryRow?.total_cents ?? 0)
      : realtime.totalExpenseCents;
    const categoryIds = entries
      .map((entry) => entry.categoryId)
      .filter((categoryId): categoryId is string => typeof categoryId === 'string');
    const categories = await this.repository.listCategories([...new Set(categoryIds)]);
    const categoryBreakdown = buildCategorySummaries({
      categories,
      entries,
      totalExpenseCents,
    });
    const pendingConfirmationCount = transactions.filter(
      (transaction) => transaction.status === 'pending_confirmation',
    ).length;
    const aiCoveredCount = transactions.filter(
      (transaction) => transaction.category_id !== null,
    ).length;
    const transactionCount =
      transactions.length > 0
        ? transactions.length
        : entries.reduce((total, entry) => total + entry.transactionCount, 0);

    return monthlySummarySchema.parse({
      aiCoverageRate:
        transactionCount > 0
          ? Math.round((aiCoveredCount / transactionCount) * 1000) / 10
          : 0,
      aiCoveredCount,
      categoryBreakdown,
      hasTransactions: transactionCount > 0 || totalExpenseCents > 0,
      month: input.month,
      pendingConfirmationCount,
      spotlight: createSpotlight({
        categoryBreakdown,
        pendingConfirmationCount,
        transactionCount,
      }),
      totalExpenseCents,
      transactionCount,
    });
  }
}

export function getDashboardService(): DashboardService {
  return new DashboardService();
}

