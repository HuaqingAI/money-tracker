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

export const BILLING_TRANSACTION_DIRECTIONS = {
  closed: 'closed',
  expense: 'expense',
  income: 'income',
  refund: 'refund',
} as const;

export const BILLING_SYSTEM_CATEGORY_IDS = {
  dining: '00000000-0000-0000-0000-000000000001',
  transport: '00000000-0000-0000-0000-000000000002',
  shopping: '00000000-0000-0000-0000-000000000003',
  housing: '00000000-0000-0000-0000-000000000004',
  entertainment: '00000000-0000-0000-0000-000000000005',
  healthcare: '00000000-0000-0000-0000-000000000006',
  education: '00000000-0000-0000-0000-000000000007',
  livingServices: '00000000-0000-0000-0000-000000000008',
  transfer: '00000000-0000-0000-0000-000000000009',
  other: '00000000-0000-0000-0000-000000000010',
} as const;

export const BILLING_SYSTEM_CATEGORY_NAMES_BY_ID: Readonly<
  Record<string, string>
> = {
  [BILLING_SYSTEM_CATEGORY_IDS.dining]: '餐饮',
  [BILLING_SYSTEM_CATEGORY_IDS.transport]: '交通',
  [BILLING_SYSTEM_CATEGORY_IDS.shopping]: '购物',
  [BILLING_SYSTEM_CATEGORY_IDS.housing]: '住房',
  [BILLING_SYSTEM_CATEGORY_IDS.entertainment]: '娱乐',
  [BILLING_SYSTEM_CATEGORY_IDS.healthcare]: '医疗',
  [BILLING_SYSTEM_CATEGORY_IDS.education]: '教育',
  [BILLING_SYSTEM_CATEGORY_IDS.livingServices]: '生活服务',
  [BILLING_SYSTEM_CATEGORY_IDS.transfer]: '转账',
  [BILLING_SYSTEM_CATEGORY_IDS.other]: '其他',
};

export const BILLING_DIRECTION_CONFIDENCE = {
  high: 'high',
  low: 'low',
  medium: 'medium',
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

