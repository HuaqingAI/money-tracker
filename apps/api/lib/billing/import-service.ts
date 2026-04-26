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
  merchant: string | null;
  source: string | null;
  transaction_at: string;
}

export interface BillingTransactionRepository {
  findExisting(input: {
    source: BillingTransactionSource;
    transactionAts: string[];
    userId: string;
  }): Promise<ExistingTransactionKey[]>;
  insertTransactions(transactions: TransactionInsert[]): Promise<void>;
}

export class SupabaseBillingTransactionRepository
  implements BillingTransactionRepository
{
  async findExisting(input: {
    source: BillingTransactionSource;
    transactionAts: string[];
    userId: string;
  }): Promise<ExistingTransactionKey[]> {
    if (input.transactionAts.length === 0) {
      return [];
    }

    const { data, error } = await getSupabaseAdmin()
      .schema('billing')
      .from('transactions')
      .select('amount_cents, merchant, source, transaction_at')
      .eq('user_id', input.userId)
      .eq('source', input.source)
      .in('transaction_at', input.transactionAts);

    if (error) {
      throw new BillingImportError(
        BILLING_IMPORT_ERROR_CODES.importServiceUnavailable,
        '读取历史交易失败，请稍后重试',
        503,
      );
    }

    return data ?? [];
  }

  async insertTransactions(transactions: TransactionInsert[]): Promise<void> {
    if (transactions.length === 0) {
      return;
    }

    const { error } = await getSupabaseAdmin()
      .schema('billing')
      .from('transactions')
      .insert(transactions);

    if (error) {
      throw new BillingImportError(
        BILLING_IMPORT_ERROR_CODES.importServiceUnavailable,
        '导入交易失败，请稍后重试',
        503,
      );
    }
  }
}

function createDedupeKey(input: {
  amount_cents: number;
  merchant: string | null;
  source: string | null;
  transaction_at: string;
}): string {
  return [
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
      source,
      transactionAts: uniqueTransactions.map(
        (transaction) => transaction.transaction_at,
      ),
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

    await this.transactionRepository.insertTransactions(
      toInsert.map((transaction) => ({
        user_id: input.userId,
        amount_cents: transaction.amount_cents,
        status: transaction.status,
        source: transaction.source,
        merchant: transaction.merchant,
        description: transaction.description,
        transaction_at: transaction.transaction_at,
      })),
    );

    return {
      totalCount: parsed.totalCount,
      importedCount: toInsert.length,
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
