import { describe, expect, it } from 'vitest';

import {
  billingCsvParseRuleSchema,
  billingNormalizedTransactionSchema,
  csvRuleUpdateInputSchema,
  importCsvResultSchema,
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
});
