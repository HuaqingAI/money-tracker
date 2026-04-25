// Types
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
  CompositeTypes,
  Database,
  Enums,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
} from './types/database';
export type { LoginMethod, UserProfile } from './types/user';

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

// Schemas
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
export type { UpdateUserProfileInput } from './schemas/user';
export { updateUserProfileSchema } from './schemas/user';

// Utils
export { formatAmountCents } from './utils/format-amount';
export { maskPhoneNumber } from './utils/mask-phone-number';
