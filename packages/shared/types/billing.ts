import type {
  BILLING_CSV_PLATFORMS,
  BILLING_IMPORT_ERROR_CODES,
  BILLING_ROUTE_PATHS,
  BILLING_TRANSACTION_SOURCES,
  BILLING_TRANSACTION_STATUS,
} from '../constants/billing';

export type BillingCsvPlatform =
  (typeof BILLING_CSV_PLATFORMS)[keyof typeof BILLING_CSV_PLATFORMS];

export type BillingTransactionSource =
  (typeof BILLING_TRANSACTION_SOURCES)[keyof typeof BILLING_TRANSACTION_SOURCES];

export type BillingTransactionStatus =
  (typeof BILLING_TRANSACTION_STATUS)[keyof typeof BILLING_TRANSACTION_STATUS];

export type BillingImportErrorCode =
  (typeof BILLING_IMPORT_ERROR_CODES)[keyof typeof BILLING_IMPORT_ERROR_CODES];

export type BillingRoutePath =
  (typeof BILLING_ROUTE_PATHS)[keyof typeof BILLING_ROUTE_PATHS];

export type BillingCsvEncoding = 'utf-8' | 'gb18030' | 'gbk';

export interface BillingCsvColumnMapping {
  amount: string;
  transactionAt: string;
  merchant?: string;
  description?: string;
  direction?: string;
  status?: string;
}

export interface BillingCsvParseRule {
  platform: BillingCsvPlatform;
  encoding: BillingCsvEncoding;
  headerMatch: string[];
  skipRows: number;
  columnMapping: BillingCsvColumnMapping;
  dateFormat: string;
  version?: string;
}

export interface BillingNormalizedTransaction {
  amount_cents: number;
  transaction_at: string;
  merchant: string | null;
  description: string | null;
  source: BillingTransactionSource;
  status: BillingTransactionStatus;
}

export interface ImportCsvResult {
  totalCount: number;
  importedCount: number;
  duplicateCount: number;
  failedCount: number;
  importId: string;
  platform: BillingCsvPlatform;
}

export interface CsvRuleUpdateInput {
  platform: BillingCsvPlatform;
  version: string;
  ruleConfig: BillingCsvParseRule;
  isActive?: boolean;
}

