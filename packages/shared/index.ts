export type {
  AiClassificationProvider,
  AiClient,
  ClassifyCategoryCandidate,
  ClassifyTransactionInput,
  ClassifyTransactionResult,
} from './ai/ai-client';
export { AiClientError } from './ai/ai-client';
export type {
  AiCircuitBreakerSnapshot,
  AiFallbackClock,
  AiFallbackOptions,
  AiFallbackTimer,
} from './ai/fallback';
export { AiCircuitBreaker, FallbackAiClient } from './ai/fallback';
export { defaultNotificationRuleSet } from './constants/default-notification-rules';
export type {
  NotificationCapture,
  NotificationCaptureResult,
  NotificationCaptureUpload,
  NotificationEnvelope,
  NotificationPatternRule,
  NotificationPlatform,
  NotificationRuleSet,
  NotificationTimeStrategy,
} from './schemas/notification-capture';
export {
  notificationCaptureResultSchema,
  notificationCaptureSchema,
  notificationCaptureUploadSchema,
  notificationEnvelopeSchema,
  notificationPatternRuleSchema,
  notificationPlatformSchema,
  notificationRuleSetSchema,
  notificationTimeStrategySchema,
} from './schemas/notification-capture';
export type {
  MonthlyReportCategory,
  MonthlyReportComparisons,
  MonthlyReportSource,
  MonthlyReportSummary,
  MonthlyTrend,
  MonthlyTrendComparison,
  MonthlyTrendPoint,
  TrendDirection,
} from './types/analytics';
export type { ApiResponse } from './types/api-response';
export type {
  AuthMethod,
  AuthSession,
  AuthUser,
  RefreshSessionResult,
  SendOtpResult,
  VerifyOtpResult,
  WechatCallbackResult,
} from './types/auth';
export type {
  BillingCategoryOption,
  BillingConfirmationErrorCode,
  BillingCsvColumnMapping,
  BillingCsvEncoding,
  BillingCsvParseRule,
  BillingCsvPlatform,
  BillingDirectionConfidence,
  BillingImportErrorCode,
  BillingNormalizedTransaction,
  BillingRoutePath,
  BillingTransactionDirection,
  BillingTransactionSource,
  BillingTransactionStatus,
  ConfirmBulkTransactionsInput,
  ConfirmBulkTransactionsResult,
  ConfirmTransactionResult,
  CsvRuleUpdateInput,
  ImportCsvResult,
  PendingConfirmationsResult,
  PendingConfirmationTransaction,
  RejectTransactionInput,
  RejectTransactionResult,
} from './types/billing';
export type {
  CategorySummary,
  DashboardErrorCode,
  DashboardRoutePath,
  DashboardSpotlight,
  MonthlySummary,
  RecentTransaction,
  RecentTransactionsResult,
} from './types/dashboard';
export type {
  CompositeTypes,
  Database,
  Enums,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
} from './types/database';
export type { LoginMethod, UserGender, UserProfile } from './types/user';

// Constants
export type { AuthErrorCode, AuthRoutePath } from './constants/auth';
export {
  AUTH_ACCESS_TOKEN_TTL_SECONDS,
  AUTH_ERROR_CODES,
  AUTH_OTP_RESEND_SECONDS,
  AUTH_OTP_TTL_SECONDS,
  AUTH_REFRESH_TOKEN_TTL_SECONDS,
  AUTH_ROUTE_PATHS,
} from './constants/auth';
export {
  BILLING_CONFIRMATION_ERROR_CODES,
  BILLING_CSV_PLATFORMS,
  BILLING_DIRECTION_CONFIDENCE,
  BILLING_IMPORT_ERROR_CODES,
  BILLING_IMPORT_MAX_FILE_SIZE_BYTES,
  BILLING_ROUTE_PATHS,
  BILLING_TRANSACTION_DIRECTIONS,
  BILLING_TRANSACTION_SOURCES,
  BILLING_TRANSACTION_STATUS,
} from './constants/billing';
export {
  DASHBOARD_CATEGORY_DISPLAY,
  DASHBOARD_ERROR_CODES,
  DASHBOARD_RECENT_TRANSACTIONS_DEFAULT_LIMIT,
  DASHBOARD_RECENT_TRANSACTIONS_MAX_LIMIT,
  DASHBOARD_ROUTE_PATHS,
} from './constants/dashboard';

// Schemas
export type { MonthlySummaryQuery, MonthlyTrendQuery } from './schemas/analytics';
export {
  monthlySummaryQuerySchema,
  monthlyTrendQuerySchema,
  monthStringSchema,
} from './schemas/analytics';
export type {
  OtpSendRequest,
  OtpVerifyRequest,
  RefreshSessionRequest,
  WechatCallbackRequest,
} from './schemas/auth';
export {
  mainlandChinaPhoneSchema,
  otpCodeSchema,
  otpSendRequestSchema,
  otpVerifyRequestSchema,
  refreshSessionRequestSchema,
  wechatCallbackRequestSchema,
} from './schemas/auth';
export type {
  BillingCategoryOptionInput,
  BillingCsvParseRuleInput,
  BillingCsvPlatformInput,
  BillingNormalizedTransactionInput,
  ConfirmBulkTransactionsInputSchema,
  ConfirmBulkTransactionsResultInput,
  ConfirmTransactionInputSchema,
  ConfirmTransactionResultInput,
  CsvRuleUpdateInputSchema,
  ImportCsvResultInput,
  PendingConfirmationsResultInput,
  PendingConfirmationTransactionInput,
  RejectTransactionInputSchema,
  RejectTransactionResultInput,
} from './schemas/billing';
export {
  aiClassificationProviderSchema,
  billingCategoryOptionSchema,
  billingCsvColumnMappingSchema,
  billingCsvEncodingSchema,
  billingCsvParseRuleSchema,
  billingCsvPlatformSchema,
  billingDirectionConfidenceSchema,
  billingNormalizedTransactionSchema,
  billingTransactionDirectionSchema,
  confirmBulkTransactionsInputSchema,
  confirmBulkTransactionsResultSchema,
  confirmTransactionInputSchema,
  confirmTransactionResultSchema,
  csvRuleUpdateInputSchema,
  importCsvResultSchema,
  pendingConfirmationsResultSchema,
  pendingConfirmationTransactionSchema,
  rejectTransactionInputSchema,
  rejectTransactionResultSchema,
} from './schemas/billing';
export type {
  DashboardMonthInput,
  DashboardRecentTransactionsLimitInput,
  MonthlySummaryInput,
  RecentTransactionsResultInput,
} from './schemas/dashboard';
export {
  dashboardCategorySummarySchema,
  dashboardMonthSchema,
  dashboardRecentTransactionsLimitSchema,
  dashboardSpotlightSchema,
  monthlySummarySchema,
  recentTransactionSchema,
  recentTransactionsResultSchema,
} from './schemas/dashboard';
export type { UpdateUserProfileInput } from './schemas/user';
export { updateUserProfileSchema } from './schemas/user';

// Utils
export { formatAmountCents } from './utils/format-amount';
export { maskPhoneNumber } from './utils/mask-phone-number';
export type { MonthlyCategoryInput, UtcMonthRange } from './utils/monthly-report';
export {
  aggregateMonthlyCategories,
  buildMonthlyComparisons,
  calculatePercentage,
  getUtcMonthRange,
  shiftMonth,
} from './utils/monthly-report';
export {
  amountTextToCents,
  extractNotificationCapture,
  isDuplicateNotificationCapture,
  normalizeMerchantName,
  normalizeNotificationCapture,
  normalizeNotificationText,
} from './utils/notification-capture';
