import {
  BILLING_IMPORT_ERROR_CODES,
  type BillingNormalizedTransaction,
  type BillingTransactionSource,
  type ImportCsvResult,
  type TablesInsert,
} from '@money-tracker/shared';

import { getSupabaseAdmin } from '../db/supabase-admin';
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
    userId: string;
  }): Promise<ExistingTransactionKey[]>;
  insertTransactions(transactions: TransactionInsert[]): Promise<number>;
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
      } catch {
        throw toServiceUnavailable('读取历史交易失败，请稍后重试');
      }

      const { data, error } = queryResult;

      if (error) {
        throw toServiceUnavailable('读取历史交易失败，请稍后重试');
      }

      existing.push(...(data ?? []));
    }

    return existing;
  }

  async insertTransactions(transactions: TransactionInsert[]): Promise<number> {
    if (transactions.length === 0) {
      return 0;
    }

    let insertResult: {
      data: Array<{ import_dedupe_key: string | null }> | null;
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
        .select('import_dedupe_key');
    } catch {
      throw toServiceUnavailable('导入交易失败，请稍后重试');
    }

    const { data, error } = insertResult;

    if (error) {
      throw toServiceUnavailable('导入交易失败，请稍后重试');
    }

    return data?.length ?? 0;
  }
}

function createDedupeKey(input: {
  amount_cents: number;
  external_transaction_id?: string | null;
  merchant: string | null;
  source: string | null;
  transaction_at: string;
}): string {
  if (input.external_transaction_id) {
    return `external:${input.external_transaction_id}`;
  }

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

  async importCsv(input: BillingImportInput): Promise<ImportCsvResult> {
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
      const key = createDedupeKey(transaction);
      if (seen.has(key)) {
        duplicateCount += 1;
        continue;
      }

      seen.add(key);
      uniqueTransactions.push(transaction);
    }

    const existing = await this.transactionRepository.findExisting({
      importDedupeKeys: uniqueTransactions.map(createDedupeKey),
      source,
      userId: input.userId,
    });
    const existingKeys = new Set(existing.map(createDedupeKey));
    const toInsert = uniqueTransactions.filter((transaction) => {
      const duplicate = existingKeys.has(createDedupeKey(transaction));
      if (duplicate) {
        duplicateCount += 1;
      }
      return !duplicate;
    });

    const insertedCount = await this.transactionRepository.insertTransactions(
      toInsert.map((transaction) => ({
        user_id: input.userId,
        amount_cents: transaction.amount_cents,
        status: transaction.status,
        source: transaction.source,
        external_transaction_id: transaction.external_transaction_id,
        import_dedupe_key: createDedupeKey(transaction),
        merchant: transaction.merchant,
        description: transaction.description,
        transaction_at: transaction.transaction_at,
      })),
    );
    duplicateCount += toInsert.length - insertedCount;

    return {
      totalCount: parsed.totalCount,
      importedCount: insertedCount,
      duplicateCount,
      failedCount: parsed.failedCount,
      importId: crypto.randomUUID(),
      platform: parsed.platform,
    };
  }
}

export function getBillingImportService(): BillingImportService {
  return new BillingImportService();
}
