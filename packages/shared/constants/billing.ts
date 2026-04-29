export const BILLING_IMPORT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const BILLING_ROUTE_PATHS = {
  importCsv: '/api/billing/import-csv',
  adminCsvRules: '/api/admin/csv-rules',
  pendingConfirmations: '/api/billing/pending-confirmations',
  transactionConfirmBase: '/api/billing/transactions',
  confirmBulk: '/api/billing/transactions/confirm-bulk',
} as const;

export const BILLING_CSV_PLATFORMS = {
  alipay: 'alipay',
  wechat: 'wechat',
} as const;

export const BILLING_TRANSACTION_SOURCES = {
  alipayCsv: 'alipay_csv',
  wechatCsv: 'wechat_csv',
} as const;

export const BILLING_TRANSACTION_STATUS = {
  confirmed: 'confirmed',
  pendingConfirmation: 'pending_confirmation',
  rejected: 'rejected',
} as const;

export const BILLING_IMPORT_ERROR_CODES = {
  authUnauthorized: 'AUTH_UNAUTHORIZED',
  importEncodingError: 'IMPORT_ENCODING_ERROR',
  invalidCsvFile: 'INVALID_CSV_FILE',
  invalidCsvRule: 'INVALID_CSV_RULE',
  invalidImportRequest: 'INVALID_IMPORT_REQUEST',
  importFileTooLarge: 'IMPORT_FILE_TOO_LARGE',
  importParseError: 'IMPORT_PARSE_ERROR',
  importServiceUnavailable: 'IMPORT_SERVICE_UNAVAILABLE',
  csvRulesUnauthorized: 'CSV_RULES_UNAUTHORIZED',
  csvRulesUpdateFailed: 'CSV_RULES_UPDATE_FAILED',
} as const;

export const BILLING_CONFIRMATION_ERROR_CODES = {
  authUnauthorized: 'AUTH_UNAUTHORIZED',
  classificationFailed: 'CLASSIFICATION_FAILED',
  confirmationFailed: 'CONFIRMATION_FAILED',
  invalidCategory: 'INVALID_CATEGORY',
  invalidConfirmationRequest: 'INVALID_CONFIRMATION_REQUEST',
  pendingConfirmationsFailed: 'PENDING_CONFIRMATIONS_FAILED',
  transactionNotFound: 'TRANSACTION_NOT_FOUND',
} as const;

