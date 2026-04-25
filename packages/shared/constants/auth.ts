export const AUTH_ROUTE_PATHS = {
  register: '/(auth)/register',
  permissions: '/(setup)/permissions',
  dashboard: '/(main)/dashboard',
  me: '/(main)/me',
} as const;

export type AuthRoutePath =
  (typeof AUTH_ROUTE_PATHS)[keyof typeof AUTH_ROUTE_PATHS];

export const AUTH_ERROR_CODES = {
  invalidInput: 'AUTH_INVALID_INPUT',
  invalidPhone: 'AUTH_INVALID_PHONE',
  otpInvalid: 'AUTH_OTP_INVALID',
  otpExpired: 'AUTH_OTP_EXPIRED',
  otpNotRequested: 'AUTH_OTP_NOT_REQUESTED',
  consentRequired: 'AUTH_CONSENT_REQUIRED',
  refreshInvalid: 'AUTH_REFRESH_INVALID',
  unauthorized: 'AUTH_UNAUTHORIZED',
  wechatNotConfigured: 'AUTH_WECHAT_NOT_CONFIGURED',
} as const;

export type AuthErrorCode =
  (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

export const AUTH_ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const AUTH_REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
export const AUTH_OTP_TTL_SECONDS = 5 * 60;
export const AUTH_OTP_RESEND_SECONDS = 60;
