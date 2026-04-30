import { z } from 'zod';

import {
  BILLING_CSV_PLATFORMS,
  BILLING_DIRECTION_CONFIDENCE,
  BILLING_TRANSACTION_DIRECTIONS,
  BILLING_TRANSACTION_SOURCES,
  BILLING_TRANSACTION_STATUS,
} from '../constants/billing';

export const billingCsvPlatformSchema = z.enum([
  BILLING_CSV_PLATFORMS.alipay,
  BILLING_CSV_PLATFORMS.wechat,
]);

export const billingCsvEncodingSchema = z.enum(['utf-8', 'gb18030', 'gbk']);

export const billingTransactionDirectionSchema = z.enum([
  BILLING_TRANSACTION_DIRECTIONS.expense,
  BILLING_TRANSACTION_DIRECTIONS.income,
  BILLING_TRANSACTION_DIRECTIONS.refund,
  BILLING_TRANSACTION_DIRECTIONS.closed,
]);

export const billingDirectionConfidenceSchema = z.enum([
  BILLING_DIRECTION_CONFIDENCE.high,
  BILLING_DIRECTION_CONFIDENCE.medium,
  BILLING_DIRECTION_CONFIDENCE.low,
]);

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
  direction: billingTransactionDirectionSchema,
  direction_confidence: billingDirectionConfidenceSchema,
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

export const aiClassificationProviderSchema = z.enum([
  'development-stub',
  'gpt-5.3-codex',
  'qwen-3.6-plus',
  'rule',
]);

export const billingCategoryOptionSchema = z.object({
  icon: z.string().nullable(),
  id: z.string().uuid(),
  isSystem: z.boolean(),
  name: z.string().trim().min(1),
});

export const pendingConfirmationTransactionSchema = z.object({
  aiConfidence: z.number().min(0).max(1).nullable(),
  aiProvider: aiClassificationProviderSchema.nullable(),
  amountCents: z.number().int(),
  categoryId: z.string().uuid().nullable(),
  categoryName: z.string().trim().min(1),
  classifiedAt: z.string().datetime().nullable(),
  description: z.string().nullable(),
  direction: billingTransactionDirectionSchema,
  directionConfidence: billingDirectionConfidenceSchema,
  id: z.string().uuid(),
  merchant: z.string().nullable(),
  source: z.string().nullable(),
  status: z.literal(BILLING_TRANSACTION_STATUS.pendingConfirmation),
  transactionAt: z.string().datetime(),
});

export const pendingConfirmationsResultSchema = z.object({
  categories: z.array(billingCategoryOptionSchema),
  classification: z.object({
    classifiedCount: z.number().int().min(0),
    totalCount: z.number().int().min(0),
    unclassifiedCount: z.number().int().min(0),
  }),
  transactions: z.array(pendingConfirmationTransactionSchema),
});

export const confirmTransactionResultSchema = z.object({
  status: z.literal(BILLING_TRANSACTION_STATUS.confirmed),
  transactionId: z.string().uuid(),
});

export const confirmTransactionInputSchema = z.object({
  categoryId: z.string().uuid().optional(),
});

export const rejectTransactionInputSchema = z.object({
  categoryId: z.string().uuid().optional(),
});

export const rejectTransactionResultSchema = z.object({
  categoryId: z.string().uuid().nullable(),
  status: z.literal(BILLING_TRANSACTION_STATUS.rejected),
  transactionId: z.string().uuid(),
});

export const confirmBulkTransactionsInputSchema = z.object({
  transactionIds: z.array(z.string().uuid()).min(1).max(100),
});

export const confirmBulkTransactionsResultSchema = z.object({
  confirmedCount: z.number().int().min(0),
});

export type BillingCsvPlatformInput = z.infer<typeof billingCsvPlatformSchema>;
export type BillingCsvParseRuleInput = z.infer<typeof billingCsvParseRuleSchema>;
export type BillingNormalizedTransactionInput = z.infer<
  typeof billingNormalizedTransactionSchema
>;
export type ImportCsvResultInput = z.infer<typeof importCsvResultSchema>;
export type CsvRuleUpdateInputSchema = z.infer<typeof csvRuleUpdateInputSchema>;
export type BillingCategoryOptionInput = z.infer<
  typeof billingCategoryOptionSchema
>;
export type PendingConfirmationTransactionInput = z.infer<
  typeof pendingConfirmationTransactionSchema
>;
export type PendingConfirmationsResultInput = z.infer<
  typeof pendingConfirmationsResultSchema
>;
export type ConfirmTransactionResultInput = z.infer<
  typeof confirmTransactionResultSchema
>;
export type ConfirmTransactionInputSchema = z.infer<
  typeof confirmTransactionInputSchema
>;
export type RejectTransactionInputSchema = z.infer<
  typeof rejectTransactionInputSchema
>;
export type RejectTransactionResultInput = z.infer<
  typeof rejectTransactionResultSchema
>;
export type ConfirmBulkTransactionsInputSchema = z.infer<
  typeof confirmBulkTransactionsInputSchema
>;
export type ConfirmBulkTransactionsResultInput = z.infer<
  typeof confirmBulkTransactionsResultSchema
>;
