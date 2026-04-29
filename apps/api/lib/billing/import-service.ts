import {
  BILLING_IMPORT_ERROR_CODES,
  type BillingNormalizedTransaction,
  type BillingTransactionSource,
  type ImportCsvResult,
  type TablesInsert,
} from '@money-tracker/shared';

import { getSupabaseAdmin } from '../db/supabase-admin';
import { logger } from '../logger';
import { parseBillingCsv } from './csv-parser';
import { type CsvRuleRepository, getCsvRuleRepository } from './csv-rule-repository';
import { BillingImportError } from './errors';

type TransactionInsert = TablesInsert<
  { schema: 'billing' },
  'transactions'
>;

export interface BillingImportInput {
  bytes: Uint8Array;
  fileName: string;
  userId: string;
}

export interface ExistingTransactionKey {
  amount_cents: number;
  external_transaction_id: string | null;
  import_dedupe_key: string | null;
  merchant: string | null;
  source: string | null;
  transaction_at: string;
}

export interface BillingTransactionRepository {
  findExisting(input: {
    importDedupeKeys: string[];
    source: BillingTransactionSource;
    transactionAts: string[];
    userId: string;
  }): Promise<ExistingTransactionKey[]>;
  insertTransactions(transactions: TransactionInsert[]): Promise<string[]>;
}

export interface BillingImportInternalResult extends ImportCsvResult {
  importedTransactionIds: string[];
}

function shouldUseDevelopmentSchemaFallback(): boolean {
  return process.env.NODE_ENV !== 'production';
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === 'string' ? message : '';
  }

  return '';
}

function isMissingImportDedupeSchema(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes('import_dedupe_key') ||
    message.includes('external_transaction_id') ||
    message.includes('no unique or exclusion constraint') ||
    message.includes('schema cache')
  );
}

function toServiceUnavailable(message: string): BillingImportError {
  return new BillingImportError(
    BILLING_IMPORT_ERROR_CODES.importServiceUnavailable,
    message,
    503,
  );
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

export class SupabaseBillingTransactionRepository
  implements BillingTransactionRepository
{
  async findExisting(input: {
    importDedupeKeys: string[];
    source: BillingTransactionSource;
    transactionAts: string[];
    userId: string;
  }): Promise<ExistingTransactionKey[]> {
    if (input.importDedupeKeys.length === 0) {
      return [];
    }

    const existing: ExistingTransactionKey[] = [];
    for (const importDedupeKeys of chunk(input.importDedupeKeys, 200)) {
      let queryResult: {
        data: ExistingTransactionKey[] | null;
        error: { message: string } | null;
      };

      try {
        queryResult = await getSupabaseAdmin()
          .schema('billing')
          .from('transactions')
          .select(
            'amount_cents, external_transaction_id, import_dedupe_key, merchant, source, transaction_at',
          )
          .eq('user_id', input.userId)
          .eq('source', input.source)
          .in('import_dedupe_key', importDedupeKeys);
      } catch (error) {
        logger.error({ err: error }, 'billing import existing query threw');
        throw toServiceUnavailable('读取历史交易失败，请稍后重试');
      }

      const { data, error } = queryResult;

      if (error) {
        logger.error({ err: error }, 'billing import existing query failed');
        if (
          shouldUseDevelopmentSchemaFallback() &&
          isMissingImportDedupeSchema(error)
        ) {
          return this.findExistingLegacy(input);
        }

        throw toServiceUnavailable('读取历史交易失败，请稍后重试');
      }

      existing.push(...(data ?? []));
    }

    return existing;
  }

  private async findExistingLegacy(input: {
    source: BillingTransactionSource;
    transactionAts: string[];
    userId: string;
  }): Promise<ExistingTransactionKey[]> {
    if (input.transactionAts.length === 0) {
      return [];
    }

    const existing: ExistingTransactionKey[] = [];
    for (const transactionAts of chunk(input.transactionAts, 200)) {
      const { data, error } = await getSupabaseAdmin()
        .schema('billing')
        .from('transactions')
        .select('amount_cents, merchant, source, transaction_at')
        .eq('user_id', input.userId)
        .eq('source', input.source)
        .in('transaction_at', transactionAts);

      if (error) {
        logger.error({ err: error }, 'billing import legacy existing query failed');
        throw toServiceUnavailable('读取历史交易失败，请稍后重试');
      }

      existing.push(
        ...(data ?? []).map((transaction) => ({
          ...transaction,
          external_transaction_id: null,
          import_dedupe_key: null,
        })),
      );
    }

    return existing;
  }

  async insertTransactions(transactions: TransactionInsert[]): Promise<string[]> {
    if (transactions.length === 0) {
      return [];
    }

    let insertResult: {
      data: Array<{ id: string }> | null;
      error: { message: string } | null;
    };

    try {
      insertResult = await getSupabaseAdmin()
        .schema('billing')
        .from('transactions')
        .upsert(transactions, {
          ignoreDuplicates: true,
          onConflict: 'user_id,source,import_dedupe_key',
        })
        .select('id');
    } catch (error) {
      logger.error({ err: error }, 'billing import insert threw');
      throw toServiceUnavailable('导入交易失败，请稍后重试');
    }

    const { data, error } = insertResult;

    if (error) {
      logger.error({ err: error }, 'billing import insert failed');
      if (
        shouldUseDevelopmentSchemaFallback() &&
        isMissingImportDedupeSchema(error)
      ) {
        return this.insertTransactionsLegacy(transactions);
      }

      throw toServiceUnavailable('导入交易失败，请稍后重试');
    }

    return (data ?? []).map((row) => row.id);
  }

  private async insertTransactionsLegacy(
    transactions: TransactionInsert[],
  ): Promise<string[]> {
    const legacyTransactions = transactions.map((transaction) => {
      const {
        external_transaction_id: _externalTransactionId,
        import_dedupe_key: _importDedupeKey,
        ...legacyTransaction
      } = transaction;
      return legacyTransaction;
    });
    const { data, error } = await getSupabaseAdmin()
      .schema('billing')
      .from('transactions')
      .insert(legacyTransactions)
      .select('id');

    if (error) {
      logger.error({ err: error }, 'billing import legacy insert failed');
      throw toServiceUnavailable('导入交易失败，请稍后重试');
    }

    return (data ?? []).map((row) => row.id);
  }
}

function createImportDedupeKey(input: {
  amount_cents: number;
  external_transaction_id?: string | null;
  import_dedupe_key?: string | null;
  merchant: string | null;
  source: string | null;
  transaction_at: string;
}): string {
  if (input.import_dedupe_key) {
    return input.import_dedupe_key;
  }

  if (input.external_transaction_id) {
    return `external:${input.external_transaction_id}`;
  }

  return createLegacyFingerprintKey(input);
}

function createLegacyFingerprintKey(input: {
  amount_cents: number;
  merchant: string | null;
  source: string | null;
  transaction_at: string;
}): string {
  return [
    'fingerprint',
    input.source ?? '',
    String(input.amount_cents),
    input.merchant ?? '',
    input.transaction_at,
  ].join('|');
}

export class BillingImportService {
  constructor(
    private readonly ruleRepository: CsvRuleRepository = getCsvRuleRepository(),
    private readonly transactionRepository: BillingTransactionRepository =
      new SupabaseBillingTransactionRepository(),
  ) {}

  async importCsv(input: BillingImportInput): Promise<BillingImportInternalResult> {
    if (!input.fileName.toLowerCase().endsWith('.csv')) {
      throw new BillingImportError(
        BILLING_IMPORT_ERROR_CODES.invalidCsvFile,
        '请选择 .csv 格式的账单文件',
        400,
      );
    }

    const rules = await this.ruleRepository.getActiveRules();
    const parsed = parseBillingCsv({
      bytes: input.bytes,
      rules,
    });
    if (parsed.transactions.length === 0) {
      throw new BillingImportError(
        BILLING_IMPORT_ERROR_CODES.importParseError,
        '未解析到可导入的有效交易记录',
        400,
      );
    }

    const source: BillingTransactionSource =
      parsed.platform === 'alipay' ? 'alipay_csv' : 'wechat_csv';
    const seen = new Set<string>();
    const uniqueTransactions: BillingNormalizedTransaction[] = [];
    let duplicateCount = 0;

    for (const transaction of parsed.transactions) {
      const key = createImportDedupeKey(transaction);
      if (seen.has(key)) {
        duplicateCount += 1;
        continue;
      }

      seen.add(key);
      uniqueTransactions.push(transaction);
    }

    const existing = await this.transactionRepository.findExisting({
      importDedupeKeys: uniqueTransactions.map(createImportDedupeKey),
      source,
      transactionAts: uniqueTransactions.map(
        (transaction) => transaction.transaction_at,
      ),
      userId: input.userId,
    });
    const existingKeys = new Set(existing.map(createImportDedupeKey));
    const existingLegacyKeys = new Set(existing.map(createLegacyFingerprintKey));
    const toInsert = uniqueTransactions.filter((transaction) => {
      const duplicate =
        existingKeys.has(createImportDedupeKey(transaction)) ||
        existingLegacyKeys.has(createLegacyFingerprintKey(transaction));
      if (duplicate) {
        duplicateCount += 1;
      }
      return !duplicate;
    });

    const importedTransactionIds =
      await this.transactionRepository.insertTransactions(
      toInsert.map((transaction) => ({
        user_id: input.userId,
        amount_cents: transaction.amount_cents,
        status: transaction.status,
        source: transaction.source,
        external_transaction_id: transaction.external_transaction_id,
        import_dedupe_key: createImportDedupeKey(transaction),
        merchant: transaction.merchant,
        description: transaction.description,
        transaction_at: transaction.transaction_at,
      })),
    );
    duplicateCount += toInsert.length - importedTransactionIds.length;

    return {
      totalCount: parsed.totalCount,
      importedCount: importedTransactionIds.length,
      duplicateCount,
      failedCount: parsed.failedCount,
      importId: crypto.randomUUID(),
      importedTransactionIds,
      platform: parsed.platform,
    };
  }
}

export function getBillingImportService(): BillingImportService {
  return new BillingImportService();
}
