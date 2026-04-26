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

import { getApiUrl } from './runtime-config';

function getApiBaseUrl(): string {
  return getApiUrl();
}

async function postJson<TResponse, TRequest>(path: string, payload: TRequest): Promise<TResponse> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let json: ApiResponse<TResponse>;

  try {
    json = (await response.json()) as ApiResponse<TResponse>;
  } catch {
    throw new Error(response.ok ? '服务器响应格式异常' : '服务暂时不可用，请稍后重试');
  }

  if (!json.success) {
    throw new Error(json.error.message);
  }

  if (!response.ok) {
    throw new Error('服务暂时不可用，请稍后重试');
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
