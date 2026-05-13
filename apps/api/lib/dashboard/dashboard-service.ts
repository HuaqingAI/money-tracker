import {
  BILLING_SYSTEM_CATEGORY_NAMES_BY_ID,
  BILLING_TRANSACTION_DIRECTIONS,
  BILLING_TRANSACTION_STATUS,
  type CategorySummary,
  DASHBOARD_CATEGORY_DISPLAY,
  type DashboardSpotlight,
  formatAmountCents,
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
  | 'direction'
  | 'direction_confidence'
  | 'merchant'
  | 'source'
  | 'status'
  | 'transaction_at'
>;

type CategoryRow = Pick<
  Tables<{ schema: 'billing' }, 'categories'>,
  'icon' | 'id' | 'name'
>;

interface CategoryBreakdownEntry {
  amountCents: number;
  categoryId: string | null;
  transactionCount: number;
}

export interface DashboardRepository {
  listCategories(categoryIds: string[]): Promise<CategoryRow[]>;
  listMonthTransactions(input: {
    endIso: string;
    startIso: string;
    userId: string;
  }): Promise<TransactionRow[]>;
}

export class SupabaseDashboardRepository implements DashboardRepository {
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
        'amount_cents, category_id, description, direction, direction_confidence, merchant, source, status, transaction_at',
      )
      .eq('user_id', input.userId)
      .gte('transaction_at', input.startIso)
      .lt('transaction_at', input.endIso)
      .in('status', [
        BILLING_TRANSACTION_STATUS.pendingConfirmation,
        BILLING_TRANSACTION_STATUS.confirmed,
      ]);

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

function aggregateTransactions(transactions: TransactionRow[]): {
  aiCoveredCount: number;
  entries: CategoryBreakdownEntry[];
  pendingConfirmationCount: number;
  pendingConfirmationExpenseCents: number;
  totalExpenseCents: number;
  transactionCount: number;
} {
  const byCategory = new Map<string, CategoryBreakdownEntry>();
  let pendingConfirmationCount = 0;
  let pendingConfirmationExpenseCents = 0;
  let totalExpenseCents = 0;
  let transactionCount = 0;
  let aiCoveredCount = 0;

  for (const transaction of transactions) {
    if (transaction.direction !== BILLING_TRANSACTION_DIRECTIONS.expense) {
      continue;
    }

    const amountCents = Math.abs(transaction.amount_cents);
    if (amountCents <= 0) {
      continue;
    }

    if (transaction.status === BILLING_TRANSACTION_STATUS.pendingConfirmation) {
      pendingConfirmationCount += 1;
      pendingConfirmationExpenseCents += amountCents;
      continue;
    }

    if (transaction.status !== BILLING_TRANSACTION_STATUS.confirmed) {
      continue;
    }

    if (transaction.category_id !== null) {
      aiCoveredCount += 1;
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
    transactionCount += 1;
  }

  return {
    aiCoveredCount,
    entries: [...byCategory.values()],
    pendingConfirmationCount,
    pendingConfirmationExpenseCents,
    totalExpenseCents,
    transactionCount,
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

function getCategoryName(category: CategoryRow | null): string | null {
  if (!category) {
    return null;
  }

  return BILLING_SYSTEM_CATEGORY_NAMES_BY_ID[category.id] ?? category.name;
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
      const categoryName = getCategoryName(category ?? null);
      const display = findCategoryDisplay(categoryName);
      const percentage =
        input.totalExpenseCents > 0
          ? Math.round((entry.amountCents / input.totalExpenseCents) * 1000) / 10
          : 0;

      return {
        amountCents: entry.amountCents,
        categoryId: entry.categoryId,
        color: display.color,
        icon: category?.icon ?? display.icon,
        name: categoryName ?? display.name,
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
    const transactions = await this.repository.listMonthTransactions({
      ...bounds,
      userId: input.userId,
    });
    const realtime = aggregateTransactions(transactions);
    const categoryIds = realtime.entries
      .map((entry) => entry.categoryId)
      .filter((categoryId): categoryId is string => typeof categoryId === 'string');
    const categories = await this.repository.listCategories([...new Set(categoryIds)]);
    const categoryBreakdown = buildCategorySummaries({
      categories,
      entries: realtime.entries,
      totalExpenseCents: realtime.totalExpenseCents,
    });
    return monthlySummarySchema.parse({
      aiCoverageRate:
        realtime.transactionCount > 0
          ? Math.round((realtime.aiCoveredCount / realtime.transactionCount) * 1000) /
            10
          : 0,
      aiCoveredCount: realtime.aiCoveredCount,
      categoryBreakdown,
      hasTransactions:
        realtime.transactionCount > 0 || realtime.pendingConfirmationCount > 0,
      month: input.month,
      pendingConfirmationCount: realtime.pendingConfirmationCount,
      pendingConfirmationExpenseCents: realtime.pendingConfirmationExpenseCents,
      spotlight: createSpotlight({
        categoryBreakdown,
        pendingConfirmationCount: realtime.pendingConfirmationCount,
        transactionCount: realtime.transactionCount + realtime.pendingConfirmationCount,
      }),
      totalExpenseCents: realtime.totalExpenseCents,
      transactionCount: realtime.transactionCount,
    });
  }
}

export function getDashboardService(): DashboardService {
  return new DashboardService();
}

