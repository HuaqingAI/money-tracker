import { z } from 'zod';

import {
  BILLING_CSV_PLATFORMS,
  BILLING_TRANSACTION_SOURCES,
  BILLING_TRANSACTION_STATUS,
} from '../constants/billing';

export const billingCsvPlatformSchema = z.enum([
  BILLING_CSV_PLATFORMS.alipay,
  BILLING_CSV_PLATFORMS.wechat,
]);

export const billingCsvEncodingSchema = z.enum(['utf-8', 'gb18030', 'gbk']);

export const billingCsvColumnMappingSchema = z.object({
  amount: z.string().trim().min(1, '金额列不能为空'),
  transactionAt: z.string().trim().min(1, '交易时间列不能为空'),
  merchant: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  direction: z.string().trim().min(1).optional(),
  externalId: z.string().trim().min(1).optional(),
  status: z.string().trim().min(1).optional(),
});

export const billingCsvParseRuleSchema = z.object({
  platform: billingCsvPlatformSchema,
  encoding: billingCsvEncodingSchema,
  headerMatch: z.array(z.string().trim().min(1)).min(1, '至少需要一个表头匹配字段'),
  skipRows: z.number().int().min(0),
  columnMapping: billingCsvColumnMappingSchema,
  dateFormat: z.string().trim().min(1, '日期格式不能为空'),
  version: z.string().trim().min(1).optional(),
});

export const billingNormalizedTransactionSchema = z.object({
  amount_cents: z.number().int(),
  transaction_at: z.string().datetime(),
  external_transaction_id: z.string().nullable(),
  merchant: z.string().nullable(),
  description: z.string().nullable(),
  source: z.enum([
    BILLING_TRANSACTION_SOURCES.alipayCsv,
    BILLING_TRANSACTION_SOURCES.wechatCsv,
  ]),
  status: z.literal(BILLING_TRANSACTION_STATUS.pendingConfirmation),
});

export const importCsvResultSchema = z.object({
  totalCount: z.number().int().min(0),
  importedCount: z.number().int().min(0),
  duplicateCount: z.number().int().min(0),
  failedCount: z.number().int().min(0),
  importId: z.string().trim().min(1),
  platform: billingCsvPlatformSchema,
});

export const csvRuleUpdateInputSchema = z.object({
  platform: billingCsvPlatformSchema,
  version: z.string().trim().min(1, '规则版本不能为空'),
  ruleConfig: billingCsvParseRuleSchema,
  isActive: z.boolean().optional(),
});

export type BillingCsvPlatformInput = z.infer<typeof billingCsvPlatformSchema>;
export type BillingCsvParseRuleInput = z.infer<typeof billingCsvParseRuleSchema>;
export type BillingNormalizedTransactionInput = z.infer<
  typeof billingNormalizedTransactionSchema
>;
export type ImportCsvResultInput = z.infer<typeof importCsvResultSchema>;
export type CsvRuleUpdateInputSchema = z.infer<typeof csvRuleUpdateInputSchema>;
