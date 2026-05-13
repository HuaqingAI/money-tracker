import {
  type AiClassificationProvider,
  type AiClient,
  BILLING_CONFIRMATION_ERROR_CODES,
  BILLING_SYSTEM_CATEGORY_NAMES_BY_ID,
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

interface PendingClassificationPlan {
  aiInputs: ClassifyTransactionInput[];
  ruleResults: ClassifyTransactionResult[];
}

const AI_CLASSIFICATION_BATCH_SIZE = 25;
const PRIMARY_AI_KEY_NAMES = ['AI_PRIMARY_API_KEY', 'OPENAI_API_KEY'] as const;

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

  classifyMany(
    inputs: ClassifyTransactionInput[],
  ): Promise<ClassifyTransactionResult[]> {
    return Promise.all(inputs.map((input) => this.classify(input)));
  }
}

export class OpenAiCompatibleClient implements AiClient {
  constructor(private readonly options: OpenAiCompatibleClientOptions) {}

  async classify(input: ClassifyTransactionInput): Promise<ClassifyTransactionResult> {
    return this.classifyMany([input]).then((results) => {
      const result = results[0];
      if (!result) {
        throw new Error('AI provider returned no classification result');
      }

      return result;
    });
  }

  async classifyMany(
    inputs: ClassifyTransactionInput[],
  ): Promise<ClassifyTransactionResult[]> {
    if (inputs.length === 0) {
      return [];
    }

    logger.info(
      {
        apiMode: this.options.apiMode,
        apiPath: this.options.apiPath,
        baseUrl: this.options.baseUrl,
        inputCount: inputs.length,
        model: this.options.model,
        provider: this.options.provider,
      },
      'ai classification provider request started',
    );
    const response = await fetch(createProviderUrl(this.options), {
      body: JSON.stringify(createProviderRequestBody(this.options, inputs)),
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    const payload = await readOpenAiCompatiblePayload(response);
    const content = extractProviderContent(payload, this.options.apiMode);
    if (!content) {
      throw new Error('AI provider returned empty content');
    }

    const results = parseClassificationResults({
      content,
      inputs,
      provider: this.options.provider,
    });
    logger.info(
      {
        inputCount: inputs.length,
        provider: this.options.provider,
      },
      'ai classification provider request completed',
    );
    return results;
  }
}

export interface OpenAiCompatiblePayload {
  choices?: Array<{ message?: { content?: string } }>;
  output?: Array<{
    content?: Array<{
      text?: unknown;
    }>;
  }>;
  output_text?: unknown;
}

export type AiProviderApiMode = 'chat-completions' | 'responses';

const classificationInstructions =
  'You classify consumer transactions. Return only compact JSON. For one transaction return {"categoryName":"餐饮","confidence":0.9}. For multiple transactions return {"results":[{"transactionId":"...","categoryName":"餐饮","confidence":0.9}]}. Use only provided category names.';

function createTransactionsPrompt(inputs: ClassifyTransactionInput[]): string {
  const categories = inputs[0]?.categories.map((category) => category.name) ?? [];

  return JSON.stringify({
    categories,
    transactions: inputs.map((input) => ({
      amountCents: input.amountCents,
      description: input.description,
      merchant: input.merchant,
      source: input.source,
      transactionAt: input.transactionAt,
      transactionId: input.transactionId,
    })),
  });
}

function createProviderRequestBody(
  options: Pick<OpenAiCompatibleClientOptions, 'apiMode' | 'model'>,
  inputs: ClassifyTransactionInput[],
): Record<string, unknown> {
  const prompt = createTransactionsPrompt(inputs);

  if (options.apiMode === 'responses') {
    return {
      input: prompt,
      instructions: classificationInstructions,
      model: options.model,
    };
  }

  return {
    messages: [
      {
        content: classificationInstructions,
        role: 'system',
      },
      {
        content: prompt,
        role: 'user',
      },
    ],
    model: options.model,
    temperature: 0,
  };
}

export function createProviderUrl(input: {
  apiPath: string;
  baseUrl: string;
}): string {
  const baseUrl = input.baseUrl.replace(/\/+$/u, '');
  const apiPath = input.apiPath.startsWith('/')
    ? input.apiPath
    : `/${input.apiPath}`;
  return `${baseUrl}${apiPath}`;
}

export async function readOpenAiCompatiblePayload(
  response: Response,
): Promise<OpenAiCompatiblePayload> {
  const contentType = response.headers.get('content-type') ?? 'unknown';
  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `AI provider failed with status ${response.status} (${contentType})`,
    );
  }

  try {
    return JSON.parse(responseText) as OpenAiCompatiblePayload;
  } catch {
    throw new Error(
      `AI provider returned non-JSON response (${contentType}). Check AI_PRIMARY_BASE_URL and AI_PRIMARY_API_PATH; they must point to an OpenAI-compatible API endpoint, for example https://api.openai.com/v1 plus /responses.`,
    );
  }
}

export function extractProviderContent(
  payload: OpenAiCompatiblePayload,
  apiMode: AiProviderApiMode,
): string | undefined {
  if (apiMode === 'chat-completions') {
    return payload.choices?.[0]?.message?.content;
  }

  if (typeof payload.output_text === 'string') {
    return payload.output_text;
  }

  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (typeof content.text === 'string') {
        return content.text;
      }
    }
  }

  return undefined;
}

function stripJsonCodeFence(content: string): string {
  const trimmed = content.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/u.exec(trimmed);
  return fenced?.[1]?.trim() ?? trimmed;
}

interface ProviderClassificationItem {
  categoryName?: unknown;
  confidence?: unknown;
  transactionId?: unknown;
}

function parseClassificationResults(input: {
  content: string;
  inputs: ClassifyTransactionInput[];
  provider: Extract<AiClassificationProvider, 'gpt-5.3-codex' | 'qwen-3.6-plus'>;
}): ClassifyTransactionResult[] {
  const parsed = JSON.parse(stripJsonCodeFence(input.content)) as unknown;
  const items = extractClassificationItems(parsed);
  const inputsByTransactionId = new Map(
    input.inputs.map((transactionInput) => [
      transactionInput.transactionId,
      transactionInput,
    ]),
  );
  const itemsByTransactionId = new Map<string, ProviderClassificationItem>();

  for (const item of items) {
    if (typeof item.transactionId === 'string') {
      itemsByTransactionId.set(item.transactionId, item);
    }
  }
  const hasTransactionIds = itemsByTransactionId.size > 0;

  if (hasTransactionIds) {
    return [...itemsByTransactionId.entries()].flatMap(
      ([transactionId, item]) => {
        const transactionInput = inputsByTransactionId.get(transactionId);
        return transactionInput
          ? [
              createClassificationResultFromProviderItem({
                item,
                provider: input.provider,
                transactionInput,
              }),
            ]
          : [];
      },
    );
  }

  return input.inputs.flatMap((transactionInput, index) => {
    const item = items[index];
    return item
      ? [
          createClassificationResultFromProviderItem({
            item,
            provider: input.provider,
            transactionInput,
          }),
        ]
      : [];
  });
}

function createClassificationResultFromProviderItem(input: {
  item: ProviderClassificationItem;
  provider: Extract<AiClassificationProvider, 'gpt-5.3-codex' | 'qwen-3.6-plus'>;
  transactionInput: ClassifyTransactionInput;
}): ClassifyTransactionResult {
  const categoryName =
    typeof input.item.categoryName === 'string'
      ? input.item.categoryName
      : '其他';
  const matched =
    input.transactionInput.categories.find(
      (category) => category.name === categoryName,
    ) ?? chooseCategory(input.transactionInput);
  const confidence =
    typeof input.item.confidence === 'number'
      ? Math.min(1, Math.max(0, input.item.confidence))
      : 0.72;

  return {
    categoryId: matched.id,
    categoryName: matched.name,
    confidence,
    provider: input.provider,
    transactionId: input.transactionInput.transactionId,
  };
}

function extractClassificationItems(parsed: unknown): ProviderClassificationItem[] {
  if (Array.isArray(parsed)) {
    return parsed.filter(isProviderClassificationItem);
  }

  if (!isObjectRecord(parsed)) {
    return [];
  }

  if (Array.isArray(parsed.results)) {
    return parsed.results.filter(isProviderClassificationItem);
  }

  if (Array.isArray(parsed.transactions)) {
    return parsed.transactions.filter(isProviderClassificationItem);
  }

  return isProviderClassificationItem(parsed) ? [parsed] : [];
}

function isProviderClassificationItem(
  value: unknown,
): value is ProviderClassificationItem {
  return isObjectRecord(value);
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

interface OpenAiCompatibleClientOptions {
  apiMode: AiProviderApiMode;
  apiKey: string;
  apiPath: string;
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

function resolveApiMode(
  value: string | undefined,
  fallback: AiProviderApiMode,
): AiProviderApiMode {
  if (!value) {
    return fallback;
  }

  if (value === 'chat-completions' || value === 'responses') {
    return value;
  }

  throw new Error(
    `Unsupported AI API mode "${value}". Use "responses" or "chat-completions".`,
  );
}

function defaultApiPath(apiMode: AiProviderApiMode): string {
  return apiMode === 'responses' ? '/responses' : '/chat/completions';
}

export function resolveDefaultAiClientConfig(
  env: EnvMap = process.env,
): DefaultAiClientConfig {
  const isProduction = env.NODE_ENV === 'production';
  const primaryKey = firstConfiguredEnv(env, [...PRIMARY_AI_KEY_NAMES]);
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
  const primaryApiMode = resolveApiMode(
    firstConfiguredEnv(env, ['AI_PRIMARY_API_MODE', 'OPENAI_API_MODE']),
    'responses',
  );
  const fallbackApiMode = resolveApiMode(
    firstConfiguredEnv(env, ['AI_FALLBACK_API_MODE', 'QWEN_API_MODE']),
    'chat-completions',
  );

  if (!primaryKey) {
    return {
      fallback: null,
      mode: isProduction ? 'production-missing-key' : 'development-stub',
      primary: null,
    };
  }

  const primary: OpenAiCompatibleClientOptions = {
    apiMode: primaryApiMode,
    apiKey: primaryKey,
    apiPath:
      firstConfiguredEnv(env, ['AI_PRIMARY_API_PATH', 'OPENAI_API_PATH']) ??
      defaultApiPath(primaryApiMode),
    baseUrl: primaryBaseUrl,
    model: firstConfiguredEnv(env, ['AI_PRIMARY_MODEL']) ?? 'gpt-5.3-codex',
    provider: 'gpt-5.3-codex',
  };
  const fallback =
    fallbackKey && fallbackBaseUrl
      ? {
          apiMode: fallbackApiMode,
          apiKey: fallbackKey,
          apiPath:
            firstConfiguredEnv(env, ['AI_FALLBACK_API_PATH', 'QWEN_API_PATH']) ??
            defaultApiPath(fallbackApiMode),
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

function normalizeCategoryRow(category: CategoryRow): CategoryRow {
  return {
    ...category,
    name: BILLING_SYSTEM_CATEGORY_NAMES_BY_ID[category.id] ?? category.name,
  };
}

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
      name: BILLING_SYSTEM_CATEGORY_NAMES_BY_ID[category.id] ?? category.name,
    })),
    description: input.transaction.description,
    merchant: input.transaction.merchant,
    source: input.transaction.source,
    transactionAt: new Date(input.transaction.transaction_at).toISOString(),
    transactionId: input.transaction.id,
    userId: input.transaction.user_id,
  };
}

async function classifyManyWithClient(
  aiClient: AiClient,
  inputs: ClassifyTransactionInput[],
): Promise<ClassifyTransactionResult[]> {
  if (inputs.length === 0) {
    return [];
  }

  if (aiClient.classifyMany) {
    return aiClient.classifyMany(inputs);
  }

  return Promise.all(inputs.map((aiInput) => aiClient.classify(aiInput)));
}

function chunkClassificationInputs(
  inputs: ClassifyTransactionInput[],
): ClassifyTransactionInput[][] {
  const chunks: ClassifyTransactionInput[][] = [];
  for (let index = 0; index < inputs.length; index += AI_CLASSIFICATION_BATCH_SIZE) {
    chunks.push(inputs.slice(index, index + AI_CLASSIFICATION_BATCH_SIZE));
  }

  return chunks;
}

function createDefaultAiClient(): AiClient {
  const config = resolveDefaultAiClientConfig();

  if (config.mode !== 'configured') {
    logger.warn(
      {
        checkedKeyNames: PRIMARY_AI_KEY_NAMES,
        mode: config.mode,
      },
      'ai classification client using non-provider mode',
    );
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

  logger.info(
    {
      apiMode: config.primary.apiMode,
      apiPath: config.primary.apiPath,
      baseUrl: config.primary.baseUrl,
      fallbackConfigured: config.fallback !== null,
      model: config.primary.model,
      provider: config.primary.provider,
    },
    'ai classification client configured',
  );

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

    const normalizedCategories = categories.map(normalizeCategoryRow);
    const plan = transactions.reduce<PendingClassificationPlan>(
      (acc, transaction) => {
        const matchedRule = matchUserRule({ rules, transaction });
        if (matchedRule) {
          acc.ruleResults.push({
            categoryId: matchedRule.category_id,
            categoryName:
              normalizedCategories.find(
                (category) => category.id === matchedRule.category_id,
              )?.name ?? '其他',
            confidence: 1,
            provider: 'rule',
            transactionId: transaction.id,
          });
          return acc;
        }

        acc.aiInputs.push(
          createAiInput({
            categories: normalizedCategories,
            transaction,
          }),
        );
        return acc;
      },
      { aiInputs: [], ruleResults: [] },
    );
    let classifiedCount = 0;
    let failedCount = 0;
    const resultsByTransactionId = new Map<string, ClassifyTransactionResult>();

    for (const result of plan.ruleResults) {
      resultsByTransactionId.set(result.transactionId, result);
    }

    for (const aiInputChunk of chunkClassificationInputs(plan.aiInputs)) {
      try {
        const aiResults = await classifyManyWithClient(
          this.aiClient,
          aiInputChunk,
        );
        const expectedTransactionIds = new Set(
          aiInputChunk.map((aiInput) => aiInput.transactionId),
        );
        const returnedTransactionIds = new Set<string>();

        for (const result of aiResults) {
          if (!expectedTransactionIds.has(result.transactionId)) {
            logger.error(
              { resultTransactionId: result.transactionId },
              'transaction classification returned unexpected result',
            );
            continue;
          }

          returnedTransactionIds.add(result.transactionId);
          resultsByTransactionId.set(result.transactionId, result);
        }

        for (const aiInput of aiInputChunk) {
          if (!returnedTransactionIds.has(aiInput.transactionId)) {
            failedCount += 1;
            logger.error(
              { transactionId: aiInput.transactionId },
              'transaction classification result missing from batch response',
            );
          }
        }
      } catch (error) {
        failedCount += aiInputChunk.length;
        logger.error(
          {
            err: error,
            transactionIds: aiInputChunk.map((aiInput) => aiInput.transactionId),
          },
          'transaction classification batch failed',
        );
      }
    }

    for (const result of resultsByTransactionId.values()) {
      try {
        await this.repository.updateClassification({
          categoryId: result.categoryId,
          classifiedAt: new Date().toISOString(),
          confidence: result.confidence,
          provider: result.provider,
          transactionId: result.transactionId,
          userId: input.userId,
        });
        classifiedCount += 1;
      } catch (error) {
        failedCount += 1;
        logger.error(
          { err: error, transactionId: result.transactionId },
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
