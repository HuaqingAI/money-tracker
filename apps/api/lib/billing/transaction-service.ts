import {
  BILLING_TRANSACTION_STATUS,
  type BillingTransactionStatus,
  DASHBOARD_RECENT_TRANSACTIONS_DEFAULT_LIMIT,
  type RecentTransaction,
  type RecentTransactionsResult,
  recentTransactionsResultSchema,
  type Tables,
} from '@money-tracker/shared';

import { getSupabaseAdmin } from '../db/supabase-admin';

type TransactionRow = Pick<
  Tables<{ schema: 'billing' }, 'transactions'>,
  | 'amount_cents'
  | 'category_id'
  | 'description'
  | 'id'
  | 'merchant'
  | 'source'
  | 'status'
  | 'transaction_at'
>;

type CategoryRow = Pick<
  Tables<{ schema: 'billing' }, 'categories'>,
  'id' | 'name'
>;

export interface TransactionRepository {
  listCategories(categoryIds: string[]): Promise<CategoryRow[]>;
  listRecentTransactions(input: {
    limit: number;
    userId: string;
  }): Promise<TransactionRow[]>;
}

export class SupabaseTransactionRepository implements TransactionRepository {
  async listCategories(categoryIds: string[]): Promise<CategoryRow[]> {
    if (categoryIds.length === 0) {
      return [];
    }

    const { data, error } = await getSupabaseAdmin()
      .schema('billing')
      .from('categories')
      .select('id, name')
      .in('id', categoryIds);

    if (error) {
      throw new Error(`Failed to load transaction categories: ${error.message}`);
    }

    return data ?? [];
  }

  async listRecentTransactions(input: {
    limit: number;
    userId: string;
  }): Promise<TransactionRow[]> {
    const { data, error } = await getSupabaseAdmin()
      .schema('billing')
      .from('transactions')
      .select(
        'amount_cents, category_id, description, id, merchant, source, status, transaction_at',
      )
      .eq('user_id', input.userId)
      .order('transaction_at', { ascending: false })
      .limit(input.limit + 1);

    if (error) {
      throw new Error(`Failed to load recent transactions: ${error.message}`);
    }

    return data ?? [];
  }
}

function mapTransaction(input: {
  categories: Map<string, CategoryRow>;
  row: TransactionRow;
}): RecentTransaction {
  return {
    amountCents: input.row.amount_cents,
    categoryId: input.row.category_id,
    categoryName: input.row.category_id
      ? input.categories.get(input.row.category_id)?.name ?? '其他'
      : '其他',
    description: input.row.description,
    id: input.row.id,
    merchant: input.row.merchant,
    source: input.row.source,
    status: toBillingTransactionStatus(input.row.status),
    transactionAt: input.row.transaction_at,
  };
}

function toBillingTransactionStatus(status: string): BillingTransactionStatus {
  if (
    status === BILLING_TRANSACTION_STATUS.pendingConfirmation ||
    status === BILLING_TRANSACTION_STATUS.confirmed ||
    status === BILLING_TRANSACTION_STATUS.rejected
  ) {
    return status;
  }

  return BILLING_TRANSACTION_STATUS.pendingConfirmation;
}

export class TransactionService {
  constructor(
    private readonly repository: TransactionRepository =
      new SupabaseTransactionRepository(),
  ) {}

  async listRecentTransactions(input: {
    limit?: number;
    userId: string;
  }): Promise<RecentTransactionsResult> {
    const limit = input.limit ?? DASHBOARD_RECENT_TRANSACTIONS_DEFAULT_LIMIT;
    const rows = await this.repository.listRecentTransactions({
      limit,
      userId: input.userId,
    });
    const visibleRows = rows.slice(0, limit);
    const categoryIds = visibleRows
      .map((row) => row.category_id)
      .filter((categoryId): categoryId is string => typeof categoryId === 'string');
    const categories = await this.repository.listCategories([...new Set(categoryIds)]);
    const categoryById = new Map(categories.map((category) => [category.id, category]));

    return recentTransactionsResultSchema.parse({
      hasMore: rows.length > limit,
      limit,
      transactions: visibleRows.map((row) =>
        mapTransaction({
          categories: categoryById,
          row,
        }),
      ),
    });
  }
}

export function getTransactionService(): TransactionService {
  return new TransactionService();
}
