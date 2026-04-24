import { describe, expect, it } from 'vitest';

import {
  otpCodeSchema,
  otpSendRequestSchema,
  otpVerifyRequestSchema,
  refreshSessionRequestSchema,
  wechatCallbackRequestSchema,
} from './auth';

describe('auth schemas', () => {
  it('accepts a valid mainland China phone number', () => {
    expect(
      otpSendRequestSchema.parse({
        phone: '13800138000',
      }),
    ).toEqual({
      phone: '13800138000',
    });
  });

  it('rejects an invalid phone number', () => {
    expect(() =>
      otpSendRequestSchema.parse({
        phone: '123',
      }),
    ).toThrow('请输入正确的手机号');
  });

  it('validates 6-digit OTP codes', () => {
    expect(otpCodeSchema.parse('123456')).toBe('123456');
    expect(() => otpCodeSchema.parse('12345')).toThrow('请输入 6 位验证码');
  });

  it('requires consent for OTP verification payloads', () => {
    expect(
      otpVerifyRequestSchema.parse({
        phone: '13800138000',
        code: '123456',
        consentAccepted: true,
      }),
    ).toEqual({
      phone: '13800138000',
      code: '123456',
      consentAccepted: true,
    });
  });

  it('requires non-empty refresh tokens and callback codes', () => {
    expect(
      refreshSessionRequestSchema.parse({
        refreshToken: 'token-value',
      }),
    ).toEqual({
      refreshToken: 'token-value',
    });
    expect(
      wechatCallbackRequestSchema.parse({
        code: 'dev-code',
      }),
    ).toEqual({
      code: 'dev-code',
    });
  });
});
