import { describe, expect, it } from 'vitest';

import {
  billingCsvParseRuleSchema,
  billingNormalizedTransactionSchema,
  confirmBulkTransactionsInputSchema,
  csvRuleUpdateInputSchema,
  importCsvResultSchema,
  pendingConfirmationsResultSchema,
  rejectTransactionInputSchema,
} from './billing';

const validRule = {
  platform: 'alipay',
  encoding: 'gb18030',
  headerMatch: ['交易时间', '交易金额'],
  skipRows: 0,
  columnMapping: {
    amount: '交易金额',
    transactionAt: '交易时间',
    merchant: '交易对方',
    description: '商品说明',
  },
  dateFormat: 'yyyy-MM-dd HH:mm:ss',
};

describe('billing schemas', () => {
  it('accepts a complete CSV parse rule', () => {
    expect(billingCsvParseRuleSchema.parse(validRule)).toEqual(validRule);
  });

  it('rejects parse rules without a header matcher', () => {
    expect(() =>
      billingCsvParseRuleSchema.parse({
        ...validRule,
        headerMatch: [],
      }),
    ).toThrow('至少需要一个表头匹配字段');
  });

  it('requires integer cents and UTC ISO time in normalized transactions', () => {
    expect(
      billingNormalizedTransactionSchema.parse({
        amount_cents: -1234,
        transaction_at: '2026-04-26T02:30:00.000Z',
        external_transaction_id: 'wx-1',
        merchant: '便利店',
        description: '早餐',
        source: 'alipay_csv',
        status: 'pending_confirmation',
      }),
    ).toEqual({
      amount_cents: -1234,
      transaction_at: '2026-04-26T02:30:00.000Z',
      external_transaction_id: 'wx-1',
      merchant: '便利店',
      description: '早餐',
      source: 'alipay_csv',
      status: 'pending_confirmation',
    });

    expect(() =>
      billingNormalizedTransactionSchema.parse({
        amount_cents: 12.34,
        transaction_at: '2026-04-26 10:30:00',
        external_transaction_id: null,
        merchant: null,
        description: null,
        source: 'alipay_csv',
        status: 'pending_confirmation',
      }),
    ).toThrow();
  });

  it('validates import summaries and admin rule updates', () => {
    expect(
      importCsvResultSchema.parse({
        totalCount: 2,
        importedCount: 1,
        duplicateCount: 1,
        failedCount: 0,
        importId: 'import-1',
        platform: 'wechat',
      }),
    ).toMatchObject({
      duplicateCount: 1,
      platform: 'wechat',
    });

    expect(
      csvRuleUpdateInputSchema.parse({
        platform: 'alipay',
        version: '2026-04-26',
        ruleConfig: validRule,
      }),
    ).toMatchObject({
      version: '2026-04-26',
      ruleConfig: validRule,
    });
  });

  it('validates pending confirmation responses', () => {
    expect(
      pendingConfirmationsResultSchema.parse({
        categories: [
          {
            icon: 'utensils',
            id: '00000000-0000-4000-8000-000000000001',
            isSystem: true,
            name: '餐饮',
          },
        ],
        classification: {
          classifiedCount: 1,
          totalCount: 2,
          unclassifiedCount: 1,
        },
        transactions: [
          {
            aiConfidence: 0.92,
            aiProvider: 'gpt-5.3-codex',
            amountCents: -2850,
            categoryId: '00000000-0000-4000-8000-000000000001',
            categoryName: '餐饮',
            classifiedAt: '2026-04-28T01:00:00.000Z',
            description: '午餐',
            id: '11111111-1111-4111-8111-111111111111',
            merchant: '美团外卖',
            source: 'alipay_csv',
            status: 'pending_confirmation',
            transactionAt: '2026-04-28T00:30:00.000Z',
          },
        ],
      }),
    ).toMatchObject({
      classification: {
        classifiedCount: 1,
        totalCount: 2,
        unclassifiedCount: 1,
      },
      transactions: [expect.objectContaining({ categoryName: '餐饮' })],
    });
  });

  it('validates confirmation mutation requests', () => {
    expect(
      rejectTransactionInputSchema.parse({
        categoryId: '00000000-0000-4000-8000-000000000001',
      }),
    ).toEqual({
      categoryId: '00000000-0000-4000-8000-000000000001',
    });
    expect(
      confirmBulkTransactionsInputSchema.parse({
        transactionIds: ['11111111-1111-4111-8111-111111111111'],
      }),
    ).toEqual({
      transactionIds: ['11111111-1111-4111-8111-111111111111'],
    });
    expect(() =>
      confirmBulkTransactionsInputSchema.parse({ transactionIds: [] }),
    ).toThrow();
  });
});
