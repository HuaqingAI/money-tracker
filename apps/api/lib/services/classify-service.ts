import {
  type AiClassificationProvider,
  type AiClient,
  BILLING_CONFIRMATION_ERROR_CODES,
  BILLING_TRANSACTION_STATUS,
  type ClassifyCategoryCandidate,
  type ClassifyTransactionInput,
  type ClassifyTransactionResult,
  FallbackAiClient,
  type Tables,
} from '@money-tracker/shared';

import { BillingConfirmationError } from '../billing/confirmation-error';
import { getSupabaseAdmin } from '../db/supabase-admin';
import { logger } from '../logger';

type CategoryRow = Pick<
  Tables<{ schema: 'billing' }, 'categories'>,
  'id' | 'is_system' | 'name' | 'sort_order' | 'user_id'
>;

type CategoryRuleRow = Pick<
  Tables<{ schema: 'billing' }, 'category_rules'>,
  'category_id' | 'keyword' | 'user_id'
>;

type ClassifiableTransactionRow = Pick<
  Tables<{ schema: 'billing' }, 'transactions'>,
  | 'amount_cents'
  | 'category_id'
  | 'description'
  | 'id'
  | 'merchant'
  | 'source'
  | 'transaction_at'
  | 'user_id'
>;

export interface ClassificationSummary {
  failedCount: number;
  classifiedCount: number;
  totalCount: number;
}

export interface ClassificationRepository {
  listCategories(userId: string): Promise<CategoryRow[]>;
  listPendingUnclassifiedTransactions(input: {
    limit: number;
    transactionIds?: string[];
    userId: string;
  }): Promise<ClassifiableTransactionRow[]>;
  listUserRules(userId: string): Promise<CategoryRuleRow[]>;
  updateClassification(input: {
    categoryId: string | null;
    classifiedAt: string;
    confidence: number;
    provider: AiClassificationProvider;
    transactionId: string;
    userId: string;
  }): Promise<void>;
}

class SupabaseClassificationRepository implements ClassificationRepository {
  async listCategories(userId: string): Promise<CategoryRow[]> {
    const { data, error } = await getSupabaseAdmin()
      .schema('billing')
      .from('categories')
      .select('id, is_system, name, sort_order, user_id')
      .or(`is_system.eq.true,user_id.eq.${userId}`)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to load categories: ${error.message}`);
    }

    return data ?? [];
  }

  async listUserRules(userId: string): Promise<CategoryRuleRow[]> {
    const { data, error } = await getSupabaseAdmin()
      .schema('billing')
      .from('category_rules')
      .select('category_id, keyword, user_id')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to load category rules: ${error.message}`);
    }

    return data ?? [];
  }

  async listPendingUnclassifiedTransactions(input: {
    limit: number;
    transactionIds?: string[];
    userId: string;
  }): Promise<ClassifiableTransactionRow[]> {
    let query = getSupabaseAdmin()
      .schema('billing')
      .from('transactions')
      .select(
        'amount_cents, category_id, description, id, merchant, source, transaction_at, user_id',
      )
      .eq('user_id', input.userId)
      .eq('status', BILLING_TRANSACTION_STATUS.pendingConfirmation)
      .is('classified_at', null)
      .order('transaction_at', { ascending: false });

    if (input.transactionIds && input.transactionIds.length > 0) {
      query = query.in('id', input.transactionIds);
    }

    const { data, error } = await query.limit(input.limit);

    if (error) {
      throw new Error(`Failed to load transactions to classify: ${error.message}`);
    }

    return data ?? [];
  }

  async updateClassification(input: {
    categoryId: string | null;
    classifiedAt: string;
    confidence: number;
    provider: AiClassificationProvider;
    transactionId: string;
    userId: string;
  }): Promise<void> {
    const { error } = await getSupabaseAdmin()
      .schema('billing')
      .from('transactions')
      .update({
        ai_confidence: input.confidence,
        ai_provider: input.provider,
        category_id: input.categoryId,
        classified_at: input.classifiedAt,
        updated_at: input.classifiedAt,
      })
      .eq('id', input.transactionId)
      .eq('user_id', input.userId)
      .eq('status', BILLING_TRANSACTION_STATUS.pendingConfirmation);

    if (error) {
      throw new Error(`Failed to update classification: ${error.message}`);
    }
  }
}

class DevelopmentAiClient implements AiClient {
  constructor(private readonly provider: AiClassificationProvider) {}

  classify(input: ClassifyTransactionInput): Promise<ClassifyTransactionResult> {
    const category = chooseCategory(input);
    return Promise.resolve({
      categoryId: category.id,
      categoryName: category.name,
      confidence: 0.78,
      provider: this.provider,
      transactionId: input.transactionId,
    });
  }
}

class OpenAiCompatibleClient implements AiClient {
  constructor(
    private readonly options: {
      apiKey: string;
      baseUrl: string;
      model: string;
      provider: AiClassificationProvider;
    },
  ) {}

  async classify(input: ClassifyTransactionInput): Promise<ClassifyTransactionResult> {
    logger.info(
      {
        provider: this.options.provider,
        transactionId: input.transactionId,
      },
      'ai classification provider request started',
    );
    const response = await fetch(`${this.options.baseUrl}/chat/completions`, {
      body: JSON.stringify({
        messages: [
          {
            content:
              '你是消费交易分类器。只返回 JSON：{"categoryName":"餐饮","confidence":0.9}。',
            role: 'system',
          },
          {
            content: JSON.stringify({
              amountCents: input.amountCents,
              categories: input.categories.map((category) => category.name),
              description: input.description,
              merchant: input.merchant,
              source: input.source,
            }),
            role: 'user',
          },
        ],
        model: this.options.model,
        temperature: 0,
      }),
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`AI provider failed with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('AI provider returned empty content');
    }

    const parsed = JSON.parse(content) as {
      categoryName?: unknown;
      confidence?: unknown;
    };
    const categoryName =
      typeof parsed.categoryName === 'string' ? parsed.categoryName : '其他';
    const matched =
      input.categories.find((category) => category.name === categoryName) ??
      chooseCategory(input);
    const confidence =
      typeof parsed.confidence === 'number'
        ? Math.min(1, Math.max(0, parsed.confidence))
        : 0.72;

    const result = {
      categoryId: matched.id,
      categoryName: matched.name,
      confidence,
      provider: this.options.provider,
      transactionId: input.transactionId,
    };
    logger.info(
      {
        provider: this.options.provider,
        transactionId: input.transactionId,
      },
      'ai classification provider request completed',
    );
    return result;
  }
}

interface OpenAiCompatibleClientOptions {
  apiKey: string;
  baseUrl: string;
  model: string;
  provider: Extract<AiClassificationProvider, 'gpt-5.3-codex' | 'qwen-3.6-plus'>;
}

export type DefaultAiClientConfig =
  | {
      fallback: OpenAiCompatibleClientOptions | null;
      mode: 'configured';
      primary: OpenAiCompatibleClientOptions;
    }
  | {
      fallback: null;
      mode: 'development-stub' | 'production-missing-key';
      primary: null;
    };

type EnvMap = Readonly<Record<string, string | undefined>>;

function firstConfiguredEnv(env: EnvMap, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = env[key]?.trim();
    if (value) {
      return value;
    }
  }

  return undefined;
}

export function resolveDefaultAiClientConfig(
  env: EnvMap = process.env,
): DefaultAiClientConfig {
  const isProduction = env.NODE_ENV === 'production';
  const primaryKey = firstConfiguredEnv(env, [
    'AI_PRIMARY_API_KEY',
    'OPENAI_API_KEY',
  ]);
  const primaryBaseUrl =
    firstConfiguredEnv(env, ['AI_PRIMARY_BASE_URL', 'OPENAI_BASE_URL']) ??
    'https://api.openai.com/v1';
  const fallbackKey = firstConfiguredEnv(env, [
    'AI_FALLBACK_API_KEY',
    'QWEN_API_KEY',
  ]);
  const fallbackBaseUrl = firstConfiguredEnv(env, [
    'AI_FALLBACK_BASE_URL',
    'QWEN_BASE_URL',
  ]);

  if (!primaryKey) {
    return {
      fallback: null,
      mode: isProduction ? 'production-missing-key' : 'development-stub',
      primary: null,
    };
  }

  const primary: OpenAiCompatibleClientOptions = {
    apiKey: primaryKey,
    baseUrl: primaryBaseUrl,
    model: firstConfiguredEnv(env, ['AI_PRIMARY_MODEL']) ?? 'gpt-5.3-codex',
    provider: 'gpt-5.3-codex',
  };
  const fallback =
    fallbackKey && fallbackBaseUrl
      ? {
          apiKey: fallbackKey,
          baseUrl: fallbackBaseUrl,
          model:
            firstConfiguredEnv(env, ['AI_FALLBACK_MODEL']) ?? 'qwen-3.6-plus',
          provider: 'qwen-3.6-plus' as const,
        }
      : null;

  return {
    fallback,
    mode: 'configured',
    primary,
  };
}

function normalize(value: string | null): string {
  return (value ?? '').trim().toLowerCase();
}

function chooseCategory(input: {
  categories: ClassifyCategoryCandidate[];
  description: string | null;
  merchant: string | null;
}): ClassifyCategoryCandidate {
  const haystack = `${normalize(input.merchant)} ${normalize(input.description)}`;
  const rules: Array<{ keywords: string[]; name: string }> = [
    { keywords: ['美团', '饿了么', '咖啡', '餐', '饭', '星巴克'], name: '餐饮' },
    { keywords: ['滴滴', '地铁', '公交', '打车', '停车'], name: '交通' },
    { keywords: ['淘宝', '京东', '拼多多', '超市', '便利店'], name: '购物' },
    { keywords: ['房租', '物业', '水电', '燃气'], name: '住房' },
    { keywords: ['医院', '药', '体检'], name: '医疗' },
    { keywords: ['电影', '游戏', '演出'], name: '娱乐' },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((keyword) => haystack.includes(keyword))) {
      const category = input.categories.find((item) => item.name === rule.name);
      if (category) {
        return category;
      }
    }
  }

  return (
    input.categories.find((category) => category.name === '其他') ??
    input.categories[0] ?? {
      id: nullId,
      name: '其他',
    }
  );
}

const nullId = '00000000-0000-0000-0000-000000000010';

function matchUserRule(input: {
  rules: CategoryRuleRow[];
  transaction: ClassifiableTransactionRow;
}): CategoryRuleRow | null {
  const haystack = `${input.transaction.merchant ?? ''} ${
    input.transaction.description ?? ''
  }`;
  return (
    input.rules.find((rule) => {
      const keyword = rule.keyword.trim();
      return keyword.length > 0 && haystack.includes(keyword);
    }) ?? null
  );
}

function createAiInput(input: {
  categories: CategoryRow[];
  transaction: ClassifiableTransactionRow;
}): ClassifyTransactionInput {
  return {
    amountCents: input.transaction.amount_cents,
    categories: input.categories.map((category) => ({
      id: category.id,
      name: category.name,
    })),
    description: input.transaction.description,
    merchant: input.transaction.merchant,
    source: input.transaction.source,
    transactionAt: new Date(input.transaction.transaction_at).toISOString(),
    transactionId: input.transaction.id,
    userId: input.transaction.user_id,
  };
}

function createDefaultAiClient(): AiClient {
  const config = resolveDefaultAiClientConfig();

  if (config.mode !== 'configured') {
    if (config.mode === 'production-missing-key') {
      throw new BillingConfirmationError(
        BILLING_CONFIRMATION_ERROR_CODES.classificationFailed,
        'AI 分类服务暂不可用',
        503,
      );
    }

    return new FallbackAiClient(
      new DevelopmentAiClient('development-stub'),
      new DevelopmentAiClient('qwen-3.6-plus'),
    );
  }

  return new FallbackAiClient(
    new OpenAiCompatibleClient(config.primary),
    config.fallback
      ? new OpenAiCompatibleClient(config.fallback)
      : new OpenAiCompatibleClient(config.primary),
  );
}

export class ClassifyService {
  constructor(
    private readonly repository: ClassificationRepository =
      new SupabaseClassificationRepository(),
    private readonly aiClient: AiClient = createDefaultAiClient(),
  ) {}

  async classifyPendingTransactions(input: {
    limit?: number;
    transactionIds?: string[];
    userId: string;
  }): Promise<ClassificationSummary> {
    const transactionIds = input.transactionIds ?? [];
    const limit = input.limit ?? (transactionIds.length > 0 ? transactionIds.length : 100);
    const [categories, rules, transactions] = await Promise.all([
      this.repository.listCategories(input.userId),
      this.repository.listUserRules(input.userId),
      this.repository.listPendingUnclassifiedTransactions({
        limit,
        transactionIds,
        userId: input.userId,
      }),
    ]);
    logger.info(
      {
        requestedTransactionCount: transactionIds.length,
        transactionCount: transactions.length,
        userId: input.userId,
      },
      'transaction classification batch loaded',
    );

    let classifiedCount = 0;
    let failedCount = 0;

    for (const transaction of transactions) {
      try {
        const matchedRule = matchUserRule({ rules, transaction });
        const result = matchedRule
          ? {
              categoryId: matchedRule.category_id,
              categoryName:
                categories.find((category) => category.id === matchedRule.category_id)
                  ?.name ?? '其他',
              confidence: 1,
              provider: 'rule' as const,
              transactionId: transaction.id,
            }
          : await this.aiClient.classify(
              createAiInput({
                categories,
                transaction,
              }),
            );

        await this.repository.updateClassification({
          categoryId: result.categoryId,
          classifiedAt: new Date().toISOString(),
          confidence: result.confidence,
          provider: result.provider,
          transactionId: transaction.id,
          userId: input.userId,
        });
        classifiedCount += 1;
      } catch (error) {
        failedCount += 1;
        logger.error(
          { err: error, transactionId: transaction.id },
          'transaction classification failed',
        );
      }
    }

    return {
      classifiedCount,
      failedCount,
      totalCount: transactions.length,
    };
  }
}

export function getClassifyService(): ClassifyService {
  defaultClassifyService ??= new ClassifyService();
  return defaultClassifyService;
}

let defaultClassifyService: ClassifyService | null = null;
