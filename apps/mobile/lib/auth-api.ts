import type {
  ApiResponse,
  OtpSendRequest,
  OtpVerifyRequest,
  RefreshSessionRequest,
  RefreshSessionResult,
  SendOtpResult,
  VerifyOtpResult,
  WechatCallbackRequest,
  WechatCallbackResult,
} from '@money-tracker/shared';
import Constants from 'expo-constants';

function getApiBaseUrl(): string {
  const extra = Constants.expoConfig?.extra as { apiUrl?: string | undefined } | undefined;
  return extra?.apiUrl ?? 'http://localhost:3000';
}

async function postJson<TResponse, TRequest>(path: string, payload: TRequest): Promise<TResponse> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json = (await response.json()) as ApiResponse<TResponse>;
  if (!json.success) {
    throw new Error(json.error.message);
  }

  return json.data;
}

export function sendOtp(payload: OtpSendRequest): Promise<SendOtpResult> {
  return postJson('/api/auth/otp-send', payload);
}

export function verifyOtp(payload: OtpVerifyRequest): Promise<VerifyOtpResult> {
  return postJson('/api/auth/otp-verify', payload);
}

export function refreshSession(payload: RefreshSessionRequest): Promise<RefreshSessionResult> {
  return postJson('/api/auth/refresh', payload);
}

export function wechatCallback(payload: WechatCallbackRequest): Promise<WechatCallbackResult> {
  return postJson('/api/auth/wechat-callback', payload);
}
