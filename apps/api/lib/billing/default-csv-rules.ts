import type { BillingCsvParseRule } from '@money-tracker/shared';

export const DEFAULT_CSV_PARSE_RULES: BillingCsvParseRule[] = [
  {
    platform: 'alipay',
    encoding: 'gb18030',
    headerMatch: ['交易时间', '交易金额'],
    skipRows: 0,
    columnMapping: {
      amount: '交易金额',
      transactionAt: '交易时间',
      externalId: '交易号',
      merchant: '交易对方',
      description: '商品说明',
      direction: '收/支',
      status: '交易状态',
    },
    dateFormat: 'yyyy-MM-dd HH:mm:ss',
    version: '2026-04-26-default',
  },
  {
    platform: 'wechat',
    encoding: 'utf-8',
    headerMatch: ['交易时间', '金额(元)'],
    skipRows: 0,
    columnMapping: {
      amount: '金额(元)',
      transactionAt: '交易时间',
      externalId: '交易单号',
      merchant: '交易对方',
      description: '商品',
      direction: '收/支',
      status: '当前状态',
    },
    dateFormat: 'yyyy-MM-dd HH:mm:ss',
    version: '2026-04-26-default',
  },
];
