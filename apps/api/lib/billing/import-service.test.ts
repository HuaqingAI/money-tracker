import type {
  BillingCsvParseRule,
  BillingTransactionSource,
  CsvRuleUpdateInput,
  Database,
  TablesInsert,
} from '@money-tracker/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CsvRuleRepository } from './csv-rule-repository';
import { DEFAULT_CSV_PARSE_RULES } from './default-csv-rules';
import {
  BillingImportService,
  type BillingTransactionRepository,
  type ExistingTransactionKey,
} from './import-service';

type CsvRuleRow = Database['billing']['Tables']['csv_parse_rules']['Row'];
type TransactionInsert = TablesInsert<{ schema: 'billing' }, 'transactions'>;

class FakeRuleRepository implements CsvRuleRepository {
  constructor(private readonly rules: BillingCsvParseRule[]) {}

  getActiveRules(): Promise<BillingCsvParseRule[]> {
    return Promise.resolve(this.rules);
  }

  upsertRule(_input: CsvRuleUpdateInput): Promise<CsvRuleRow> {
    throw new Error('not implemented');
  }
}

class FakeTransactionRepository implements BillingTransactionRepository {
  public inserted: TransactionInsert[] = [];
  public source: BillingTransactionSource | null = null;

  constructor(private readonly existing: ExistingTransactionKey[] = []) {}

  findExisting(input: {
    importDedupeKeys: string[];
    source: BillingTransactionSource;
    transactionAts: string[];
    userId: string;
  }): Promise<ExistingTransactionKey[]> {
    this.source = input.source;
    return Promise.resolve(this.existing);
  }

  insertTransactions(transactions: TransactionInsert[]): Promise<number> {
    this.inserted = transactions;
    return Promise.resolve(transactions.length);
  }
}

class ThrowingTransactionRepository implements BillingTransactionRepository {
  findExisting(): Promise<ExistingTransactionKey[]> {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  insertTransactions(): Promise<number> {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
}

class RaceDuplicateTransactionRepository extends FakeTransactionRepository {
  insertTransactions(transactions: TransactionInsert[]): Promise<number> {
    this.inserted = transactions;
    return Promise.resolve(0);
  }
}

function encodeUtf8(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

describe('BillingImportService', () => {
  beforeEach(() => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      '11111111-1111-4111-8111-111111111111',
    );
  });

  it('deduplicates existing rows from development legacy schema fallback', async () => {
    const csv = [
      '交易时间,交易对方,商品,收/支,金额(元),当前状态',
      '2026-04-26 10:30:00,便利店,早餐,支出,12.34,支付成功',
    ].join('\n');
    const transactionRepository = new FakeTransactionRepository([
      {
        amount_cents: -1234,
        external_transaction_id: null,
        import_dedupe_key: null,
        merchant: '便利店',
        source: 'wechat_csv',
        transaction_at: '2026-04-26T02:30:00.000Z',
      },
    ]);
    const service = new BillingImportService(
      new FakeRuleRepository(DEFAULT_CSV_PARSE_RULES),
      transactionRepository,
    );

    await expect(
      service.importCsv({
        bytes: encodeUtf8(csv),
        fileName: 'wechat.csv',
        userId: 'user-1',
      }),
    ).resolves.toMatchObject({
      importedCount: 0,
      duplicateCount: 1,
    });
  });

  it('deduplicates rows already present for the same user/source/amount/merchant/time', async () => {
    const csv = [
      '交易时间,交易对方,商品,收/支,金额(元),当前状态',
      '2026-04-26 10:30:00,便利店,早餐,支出,12.34,支付成功',
      '2026-04-26 10:30:00,便利店,早餐,支出,12.34,支付成功',
      '2026-04-26 11:00:00,咖啡店,咖啡,支出,18.00,支付成功',
    ].join('\n');
    const transactionRepository = new FakeTransactionRepository([
      {
        amount_cents: -1234,
        external_transaction_id: null,
        import_dedupe_key:
          'fingerprint|wechat_csv|-1234|便利店|2026-04-26T02:30:00.000Z',
        merchant: '便利店',
        source: 'wechat_csv',
        transaction_at: '2026-04-26T02:30:00.000Z',
      },
    ]);
    const service = new BillingImportService(
      new FakeRuleRepository(DEFAULT_CSV_PARSE_RULES),
      transactionRepository,
    );

    const result = await service.importCsv({
      bytes: encodeUtf8(csv),
      fileName: 'wechat.csv',
      userId: 'user-1',
    });

    expect(result).toEqual({
      totalCount: 3,
      importedCount: 1,
      duplicateCount: 2,
      failedCount: 0,
      importId: '11111111-1111-4111-8111-111111111111',
      platform: 'wechat',
    });
    expect(transactionRepository.source).toBe('wechat_csv');
    expect(transactionRepository.inserted).toEqual([
      expect.objectContaining({
        amount_cents: -1800,
        external_transaction_id: null,
        import_dedupe_key:
          'fingerprint|wechat_csv|-1800|咖啡店|2026-04-26T03:00:00.000Z',
        merchant: '咖啡店',
        source: 'wechat_csv',
        status: 'pending_confirmation',
        transaction_at: '2026-04-26T03:00:00.000Z',
        user_id: 'user-1',
      }),
    ]);
  });

  it('rejects non-CSV uploads before parsing', async () => {
    const service = new BillingImportService(
      new FakeRuleRepository(DEFAULT_CSV_PARSE_RULES),
      new FakeTransactionRepository(),
    );

    await expect(
      service.importCsv({
        bytes: encodeUtf8('not csv'),
        fileName: 'bill.txt',
        userId: 'user-1',
      }),
    ).rejects.toMatchObject({
      code: 'INVALID_CSV_FILE',
      status: 400,
    });
  });

  it('fails when persistence is unavailable instead of reporting a fake success', async () => {
    const csv = [
      '交易时间,交易对方,商品,收/支,金额(元),当前状态',
      '2026-04-26 10:30:00,便利店,早餐,支出,12.34,支付成功',
    ].join('\n');
    const service = new BillingImportService(
      new FakeRuleRepository(DEFAULT_CSV_PARSE_RULES),
      new ThrowingTransactionRepository(),
    );

    await expect(
      service.importCsv({
        bytes: encodeUtf8(csv),
        fileName: 'wechat.csv',
        userId: 'user-1',
      }),
    ).rejects.toThrow('SUPABASE_SERVICE_ROLE_KEY is not set');
  });

  it('counts database ignored inserts as duplicates', async () => {
    const csv = [
      '交易时间,交易对方,商品,收/支,金额(元),当前状态',
      '2026-04-26 10:30:00,便利店,早餐,支出,12.34,支付成功',
    ].join('\n');
    const transactionRepository = new RaceDuplicateTransactionRepository();
    const service = new BillingImportService(
      new FakeRuleRepository(DEFAULT_CSV_PARSE_RULES),
      transactionRepository,
    );

    await expect(
      service.importCsv({
        bytes: encodeUtf8(csv),
        fileName: 'wechat.csv',
        userId: 'user-1',
      }),
    ).resolves.toMatchObject({
      importedCount: 0,
      duplicateCount: 1,
    });
  });

  it('rejects files with no valid importable rows', async () => {
    const csv = [
      '交易时间,交易对方,商品,收/支,金额(元),当前状态',
      'bad-date,坏行,坏行,支出,not-money,支付成功',
    ].join('\n');
    const service = new BillingImportService(
      new FakeRuleRepository(DEFAULT_CSV_PARSE_RULES),
      new FakeTransactionRepository(),
    );

    await expect(
      service.importCsv({
        bytes: encodeUtf8(csv),
        fileName: 'wechat.csv',
        userId: 'user-1',
      }),
    ).rejects.toMatchObject({
      code: 'IMPORT_PARSE_ERROR',
      status: 400,
    });
  });
});
