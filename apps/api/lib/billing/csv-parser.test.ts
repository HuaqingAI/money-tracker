import { describe, expect, it } from 'vitest';

import { parseBillingCsv } from './csv-parser';
import { DEFAULT_CSV_PARSE_RULES } from './default-csv-rules';
import { BillingImportError } from './errors';

function encodeUtf8(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

describe('parseBillingCsv', () => {
  it('normalizes WeChat CSV rows into pending transactions', () => {
    const csv = [
      '交易时间,交易对方,商品,收/支,金额(元),当前状态',
      '2026-04-26 10:30:00,便利店,早餐,支出,12.34,支付成功',
      '2026-04-26 11:00:00,朋友,红包,收入,5.00,已收钱',
    ].join('\n');

    const result = parseBillingCsv({
      bytes: encodeUtf8(csv),
      rules: DEFAULT_CSV_PARSE_RULES,
    });

    expect(result).toMatchObject({
      failedCount: 0,
      platform: 'wechat',
      totalCount: 2,
    });
    expect(result.transactions).toEqual([
      {
        amount_cents: -1234,
        transaction_at: '2026-04-26T02:30:00.000Z',
        external_transaction_id: null,
        merchant: '便利店',
        description: '早餐',
        source: 'wechat_csv',
        status: 'pending_confirmation',
      },
      {
        amount_cents: 500,
        transaction_at: '2026-04-26T03:00:00.000Z',
        external_transaction_id: null,
        merchant: '朋友',
        description: '红包',
        source: 'wechat_csv',
        status: 'pending_confirmation',
      },
    ]);
  });

  it('counts malformed data rows instead of failing the whole import', () => {
    const csv = [
      '交易时间,交易金额,交易对方,商品说明,收/支,交易状态',
      '2026-04-26 10:30:00,12.34,便利店,早餐,支出,交易成功',
      'bad-date,not-money,坏行,坏行,支出,交易成功',
    ].join('\n');

    const result = parseBillingCsv({
      bytes: encodeUtf8(csv),
      rules: DEFAULT_CSV_PARSE_RULES,
    });

    expect(result).toMatchObject({
      failedCount: 1,
      platform: 'alipay',
      totalCount: 2,
    });
    expect(result.transactions).toHaveLength(1);
  });

  it('skips non-success transaction statuses', () => {
    const csv = [
      '交易时间,交易对方,商品,收/支,金额(元),当前状态',
      '2026-04-26 10:30:00,便利店,早餐,支出,12.34,支付成功',
      '2026-04-26 11:00:00,外卖,订单取消,支出,20.00,交易关闭',
      '2026-04-26 12:00:00,商户,退款,收入,10.00,退款成功',
    ].join('\n');

    const result = parseBillingCsv({
      bytes: encodeUtf8(csv),
      rules: DEFAULT_CSV_PARSE_RULES,
    });

    expect(result).toMatchObject({
      failedCount: 2,
      totalCount: 3,
    });
    expect(result.transactions).toHaveLength(1);
  });

  it('uses the configured date format', () => {
    const csv = [
      '日期,商户,金额,方向,状态',
      '2026/4/26 9:05,便利店,12.34,支出,支付成功',
    ].join('\n');

    const result = parseBillingCsv({
      bytes: encodeUtf8(csv),
      rules: [
        {
          platform: 'wechat',
          encoding: 'utf-8',
          headerMatch: ['日期', '金额'],
          skipRows: 0,
          columnMapping: {
            amount: '金额',
            transactionAt: '日期',
            merchant: '商户',
            direction: '方向',
            status: '状态',
          },
          dateFormat: 'yyyy/M/d H:mm',
        },
      ],
    });

    expect(result.transactions[0]?.transaction_at).toBe(
      '2026-04-26T01:05:00.000Z',
    );
  });

  it('rejects polluted amount cells', () => {
    const csv = [
      '交易时间,交易对方,商品,收/支,金额(元),当前状态',
      '2026-04-26 10:30:00,便利店,早餐,支出,abc12.34,支付成功',
    ].join('\n');

    const result = parseBillingCsv({
      bytes: encodeUtf8(csv),
      rules: DEFAULT_CSV_PARSE_RULES,
    });

    expect(result.failedCount).toBe(1);
    expect(result.transactions).toHaveLength(0);
  });

  it('returns an encoding error when decoding fallback cannot recover', () => {
    expect(() =>
      parseBillingCsv({
        bytes: Uint8Array.from([0xff, 0xfe, 0xfd]),
        rules: [
          {
            ...DEFAULT_CSV_PARSE_RULES[0]!,
            encoding: 'utf-8',
          },
        ],
      }),
    ).toThrow(
      expect.objectContaining({
        code: 'IMPORT_ENCODING_ERROR',
      }) as BillingImportError,
    );
  });
});
