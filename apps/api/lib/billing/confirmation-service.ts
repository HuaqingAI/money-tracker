import {
  BILLING_CONFIRMATION_ERROR_CODES,
  BILLING_SYSTEM_CATEGORY_NAMES_BY_ID,
  BILLING_TRANSACTION_STATUS,
  type BillingCategoryOption,
  type ConfirmBulkTransactionsResult,
  type ConfirmTransactionResult,
  type PendingConfirmationsResult,
  pendingConfirmationsResultSchema,
  type PendingConfirmationTransaction,
  type RejectTransactionResult,
  type Tables,
  type TablesInsert,
} from '@money-tracker/shared';

import { getSupabaseAdmin } from '../db/supabase-admin';
import { BillingConfirmationError } from './confirmation-error';

type CategoryRow = Pick<
  Tables<{ schema: 'billing' }, 'categories'>,
  'icon' | 'id' | 'is_system' | 'name' | 'sort_order' | 'user_id'
>;

type PendingTransactionRow = Pick<
  Tables<{ schema: 'billing' }, 'transactions'>,
  | 'ai_confidence'
  | 'ai_provider'
  | 'amount_cents'
  | 'category_id'
  | 'classified_at'
  | 'description'
  | 'direction'
  | 'direction_confidence'
  | 'id'
  | 'merchant'
  | 'source'
  | 'status'
  | 'transaction_at'
>;

interface PendingClassificationSummary {
  classifiedCount: number;
  totalCount: number;
  unclassifiedCount: number;
}

type CategoryRuleInsert = TablesInsert<
  { schema: 'billing' },
  'category_rules'
>;

export interface ConfirmationRepository {
  confirmBulk(input: {
    transactionIds: string[];
    userId: string;
  }): Promise<number>;
  confirmOne(input: {
    categoryId?: string;
    transactionId: string;
    userId: string;
  }): Promise<PendingTransactionRow | null>;
  getCategory(input: {
    categoryId: string;
    userId: string;
  }): Promise<CategoryRow | null>;
  getPendingClassificationSummary(
    userId: string,
  ): Promise<PendingClassificationSummary>;
  listCategories(userId: string): Promise<CategoryRow[]>;
  listPendingTransactions(userId: string): Promise<PendingTransactionRow[]>;
  rejectOne(input: {
    categoryId?: string;
    transactionId: string;
    userId: string;
  }): Promise<PendingTransactionRow | null>;
  upsertUserRule(input: {
    categoryId: string;
    keyword: string;
    userId: string;
  }): Promise<void>;
}

export class SupabaseConfirmationRepository implements ConfirmationRepository {
  async listCategories(userId: string): Promise<CategoryRow[]> {
    const { data, error } = await getSupabaseAdmin()
      .schema('billing')
      .from('categories')
      .select('icon, id, is_system, name, sort_order, user_id')
      .or(`is_system.eq.true,user_id.eq.${userId}`)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to load categories: ${error.message}`);
    }

    return data ?? [];
  }

  async listPendingTransactions(userId: string): Promise<PendingTransactionRow[]> {
    const { data, error } = await getSupabaseAdmin()
      .schema('billing')
      .from('transactions')
      .select(
        'ai_confidence, ai_provider, amount_cents, category_id, classified_at, description, direction, direction_confidence, id, merchant, source, status, transaction_at',
      )
      .eq('user_id', userId)
      .eq('status', BILLING_TRANSACTION_STATUS.pendingConfirmation)
      .not('classified_at', 'is', null)
      .order('transaction_at', { ascending: false })
      .limit(100);

    if (error) {
      throw new Error(`Failed to load pending confirmations: ${error.message}`);
    }

    return data ?? [];
  }

  async getPendingClassificationSummary(
    userId: string,
  ): Promise<PendingClassificationSummary> {
    const { data, error } = await getSupabaseAdmin()
      .schema('billing')
      .from('transactions')
      .select('classified_at')
      .eq('user_id', userId)
      .eq('status', BILLING_TRANSACTION_STATUS.pendingConfirmation);

    if (error) {
      throw new Error(
        `Failed to load pending classification summary: ${error.message}`,
      );
    }

    const rows = data ?? [];
    const classifiedCount = rows.filter(
      (row) => row.classified_at !== null,
    ).length;

    return {
      classifiedCount,
      totalCount: rows.length,
      unclassifiedCount: rows.length - classifiedCount,
    };
  }

  async getCategory(input: {
    categoryId: string;
    userId: string;
  }): Promise<CategoryRow | null> {
    const { data, error } = await getSupabaseAdmin()
      .schema('billing')
      .from('categories')
      .select('icon, id, is_system, name, sort_order, user_id')
      .eq('id', input.categoryId)
      .or(`is_system.eq.true,user_id.eq.${input.userId}`)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load category: ${error.message}`);
    }

    return data;
  }

  async confirmOne(input: {
    categoryId?: string;
    transactionId: string;
    userId: string;
  }): Promise<PendingTransactionRow | null> {
    const { data, error } = await getSupabaseAdmin()
      .schema('billing')
      .from('transactions')
      .update({
        ...(input.categoryId ? { category_id: input.categoryId } : {}),
        status: BILLING_TRANSACTION_STATUS.confirmed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.transactionId)
      .eq('user_id', input.userId)
      .eq('status', BILLING_TRANSACTION_STATUS.pendingConfirmation)
      .not('classified_at', 'is', null)
      .not('category_id', 'is', null)
      .select(
        'ai_confidence, ai_provider, amount_cents, category_id, classified_at, description, direction, direction_confidence, id, merchant, source, status, transaction_at',
      )
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to confirm transaction: ${error.message}`);
    }

    return data;
  }

  async rejectOne(input: {
    categoryId?: string;
    transactionId: string;
    userId: string;
  }): Promise<PendingTransactionRow | null> {
    const { data, error } = await getSupabaseAdmin()
      .schema('billing')
      .from('transactions')
      .update({
        ...(input.categoryId ? { category_id: input.categoryId } : {}),
        status: BILLING_TRANSACTION_STATUS.rejected,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.transactionId)
      .eq('user_id', input.userId)
      .eq('status', BILLING_TRANSACTION_STATUS.pendingConfirmation)
      .not('classified_at', 'is', null)
      .select(
        'ai_confidence, ai_provider, amount_cents, category_id, classified_at, description, direction, direction_confidence, id, merchant, source, status, transaction_at',
      )
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to reject transaction: ${error.message}`);
    }

    return data;
  }

  async confirmBulk(input: {
    transactionIds: string[];
    userId: string;
  }): Promise<number> {
    const { data, error } = await getSupabaseAdmin()
      .schema('billing')
      .from('transactions')
      .update({
        status: BILLING_TRANSACTION_STATUS.confirmed,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', input.userId)
      .eq('status', BILLING_TRANSACTION_STATUS.pendingConfirmation)
      .not('classified_at', 'is', null)
      .not('category_id', 'is', null)
      .in('id', input.transactionIds)
      .select('id');

    if (error) {
      throw new Error(`Failed to bulk confirm transactions: ${error.message}`);
    }

    return data?.length ?? 0;
  }

  async upsertUserRule(input: {
    categoryId: string;
    keyword: string;
    userId: string;
  }): Promise<void> {
    const { data: existing, error: findError } = await getSupabaseAdmin()
      .schema('billing')
      .from('category_rules')
      .select('category_id, hit_count, id, keyword, source, user_id')
      .eq('user_id', input.userId)
      .eq('keyword', input.keyword)
      .maybeSingle();

    if (findError) {
      throw new Error(`Failed to read category rule: ${findError.message}`);
    }

    const payload: CategoryRuleInsert = {
      category_id: input.categoryId,
      hit_count: (existing?.hit_count ?? 0) + 1,
      keyword: input.keyword,
      source: 'user',
      user_id: input.userId,
    };

    const { error } = await getSupabaseAdmin()
      .schema('billing')
      .from('category_rules')
      .upsert(payload, {
        onConflict: 'user_id,keyword',
      });

    if (error) {
      throw new Error(`Failed to upsert category rule: ${error.message}`);
    }
  }
}

function toIsoDatetime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid timestamp: ${value}`);
  }
  return parsed.toISOString();
}

function normalizeCategoryName(category: CategoryRow | null | undefined): string {
  if (!category) {
    return '其他';
  }

  return BILLING_SYSTEM_CATEGORY_NAMES_BY_ID[category.id] ?? category.name;
}

function toCategoryOption(category: CategoryRow): BillingCategoryOption {
  return {
    icon: category.icon,
    id: category.id,
    isSystem: category.is_system,
    name: normalizeCategoryName(category),
  };
}

function mapPendingTransaction(input: {
  categories: Map<string, CategoryRow>;
  row: PendingTransactionRow;
}): PendingConfirmationTransaction {
  return {
    aiConfidence: input.row.ai_confidence,
    aiProvider:
      input.row.ai_provider === 'development-stub' ||
      input.row.ai_provider === 'gpt-5.3-codex' ||
      input.row.ai_provider === 'qwen-3.6-plus' ||
      input.row.ai_provider === 'rule'
        ? input.row.ai_provider
        : null,
    amountCents: input.row.amount_cents,
    categoryId: input.row.category_id,
    categoryName: input.row.category_id
      ? normalizeCategoryName(input.categories.get(input.row.category_id))
      : '其他',
    classifiedAt: input.row.classified_at
      ? toIsoDatetime(input.row.classified_at)
      : null,
    description: input.row.description,
    direction: input.row.direction,
    directionConfidence: input.row.direction_confidence,
    id: input.row.id,
    merchant: input.row.merchant,
    source: input.row.source,
    status: BILLING_TRANSACTION_STATUS.pendingConfirmation,
    transactionAt: toIsoDatetime(input.row.transaction_at),
  };
}

function createFeedbackKeyword(transaction: PendingTransactionRow): string | null {
  const value = transaction.merchant ?? transaction.description;
  const keyword = value?.trim();
  return keyword && keyword.length >= 2 ? keyword.slice(0, 80) : null;
}

export class ConfirmationService {
  constructor(
    private readonly repository: ConfirmationRepository =
      new SupabaseConfirmationRepository(),
  ) {}

  async listPendingConfirmations(userId: string): Promise<PendingConfirmationsResult> {
    const [categories, classification, transactions] = await Promise.all([
      this.repository.listCategories(userId),
      this.repository.getPendingClassificationSummary(userId),
      this.repository.listPendingTransactions(userId),
    ]);
    const categoryById = new Map(categories.map((category) => [category.id, category]));

    return pendingConfirmationsResultSchema.parse({
      categories: categories.map(toCategoryOption),
      classification,
      transactions: transactions.map((row) =>
        mapPendingTransaction({
          categories: categoryById,
          row,
        }),
      ),
    });
  }

  async confirmTransaction(input: {
    categoryId?: string;
    transactionId: string;
    userId: string;
  }): Promise<ConfirmTransactionResult> {
    if (input.categoryId) {
      const category = await this.repository.getCategory({
        categoryId: input.categoryId,
        userId: input.userId,
      });
      if (!category) {
        throw new BillingConfirmationError(
          BILLING_CONFIRMATION_ERROR_CODES.invalidCategory,
          '请选择有效分类',
          400,
        );
      }
    }

    const transaction = await this.repository.confirmOne(input);
    if (!transaction) {
      throw new BillingConfirmationError(
        BILLING_CONFIRMATION_ERROR_CODES.transactionNotFound,
        '未找到可确认的交易',
        404,
      );
    }

    if (input.categoryId) {
      const keyword = createFeedbackKeyword(transaction);
      if (keyword) {
        await this.repository.upsertUserRule({
          categoryId: input.categoryId,
          keyword,
          userId: input.userId,
        });
      }
    }

    return {
      status: BILLING_TRANSACTION_STATUS.confirmed,
      transactionId: input.transactionId,
    };
  }

  async rejectTransaction(input: {
    categoryId?: string;
    transactionId: string;
    userId: string;
  }): Promise<RejectTransactionResult> {
    if (input.categoryId) {
      const category = await this.repository.getCategory({
        categoryId: input.categoryId,
        userId: input.userId,
      });
      if (!category) {
        throw new BillingConfirmationError(
          BILLING_CONFIRMATION_ERROR_CODES.invalidCategory,
          '请选择有效分类',
          400,
        );
      }
    }

    const transaction = await this.repository.rejectOne(input);
    if (!transaction) {
      throw new BillingConfirmationError(
        BILLING_CONFIRMATION_ERROR_CODES.transactionNotFound,
        '未找到可修正的交易',
        404,
      );
    }

    const keyword = input.categoryId ? createFeedbackKeyword(transaction) : null;
    if (keyword && input.categoryId) {
      await this.repository.upsertUserRule({
        categoryId: input.categoryId,
        keyword,
        userId: input.userId,
      });
    }

    return {
      categoryId: input.categoryId ?? null,
      status: BILLING_TRANSACTION_STATUS.rejected,
      transactionId: input.transactionId,
    };
  }

  async confirmBulk(input: {
    transactionIds: string[];
    userId: string;
  }): Promise<ConfirmBulkTransactionsResult> {
    const confirmedCount = await this.repository.confirmBulk(input);
    if (confirmedCount !== input.transactionIds.length) {
      throw new BillingConfirmationError(
        BILLING_CONFIRMATION_ERROR_CODES.transactionNotFound,
        '部分交易已不在待确认状态',
        409,
      );
    }
    return { confirmedCount };
  }
}

export function getConfirmationService(): ConfirmationService {
  return new ConfirmationService();
}
