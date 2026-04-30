import type { AiClassificationProvider } from '../ai/ai-client';
import type {
  BILLING_CONFIRMATION_ERROR_CODES,
  BILLING_CSV_PLATFORMS,
  BILLING_DIRECTION_CONFIDENCE,
  BILLING_IMPORT_ERROR_CODES,
  BILLING_ROUTE_PATHS,
  BILLING_TRANSACTION_DIRECTIONS,
  BILLING_TRANSACTION_SOURCES,
  BILLING_TRANSACTION_STATUS,
} from '../constants/billing';

export type BillingCsvPlatform =
  (typeof BILLING_CSV_PLATFORMS)[keyof typeof BILLING_CSV_PLATFORMS];

export type BillingTransactionSource =
  (typeof BILLING_TRANSACTION_SOURCES)[keyof typeof BILLING_TRANSACTION_SOURCES];

export type BillingTransactionStatus =
  (typeof BILLING_TRANSACTION_STATUS)[keyof typeof BILLING_TRANSACTION_STATUS];

export type BillingTransactionDirection =
  (typeof BILLING_TRANSACTION_DIRECTIONS)[keyof typeof BILLING_TRANSACTION_DIRECTIONS];

export type BillingDirectionConfidence =
  (typeof BILLING_DIRECTION_CONFIDENCE)[keyof typeof BILLING_DIRECTION_CONFIDENCE];

export type BillingImportErrorCode =
  (typeof BILLING_IMPORT_ERROR_CODES)[keyof typeof BILLING_IMPORT_ERROR_CODES];

export type BillingConfirmationErrorCode =
  (typeof BILLING_CONFIRMATION_ERROR_CODES)[keyof typeof BILLING_CONFIRMATION_ERROR_CODES];

export type BillingRoutePath =
  (typeof BILLING_ROUTE_PATHS)[keyof typeof BILLING_ROUTE_PATHS];

export type BillingCsvEncoding = 'utf-8' | 'gb18030' | 'gbk';

export interface BillingCsvColumnMapping {
  amount: string;
  transactionAt: string;
  merchant?: string;
  description?: string;
  direction?: string;
  externalId?: string;
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
  external_transaction_id: string | null;
  merchant: string | null;
  description: string | null;
  direction: BillingTransactionDirection;
  direction_confidence: BillingDirectionConfidence;
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

export interface BillingCategoryOption {
  icon: string | null;
  id: string;
  isSystem: boolean;
  name: string;
}

export interface PendingConfirmationTransaction {
  aiConfidence: number | null;
  aiProvider: AiClassificationProvider | null;
  amountCents: number;
  categoryId: string | null;
  categoryName: string;
  classifiedAt: string | null;
  description: string | null;
  direction: BillingTransactionDirection;
  directionConfidence: BillingDirectionConfidence;
  id: string;
  merchant: string | null;
  source: string | null;
  status: 'pending_confirmation';
  transactionAt: string;
}

export interface PendingConfirmationsResult {
  categories: BillingCategoryOption[];
  classification: {
    classifiedCount: number;
    totalCount: number;
    unclassifiedCount: number;
  };
  transactions: PendingConfirmationTransaction[];
}

export interface ConfirmTransactionResult {
  status: 'confirmed';
  transactionId: string;
}

export interface ConfirmTransactionInput {
  categoryId: string;
}

export interface RejectTransactionInput {
  categoryId?: string;
}

export interface RejectTransactionResult {
  categoryId: string | null;
  status: 'rejected';
  transactionId: string;
}

export interface ConfirmBulkTransactionsInput {
  transactionIds: string[];
}

export interface ConfirmBulkTransactionsResult {
  confirmedCount: number;
}
