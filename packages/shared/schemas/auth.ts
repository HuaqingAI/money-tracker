import { z } from 'zod';

export const mainlandChinaPhoneSchema = z
  .string()
  .trim()
  .regex(/^1[3-9]\d{9}$/, '请输入正确的手机号');

export const otpCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, '请输入 6 位验证码');

export const otpSendRequestSchema = z.object({
  phone: mainlandChinaPhoneSchema,
});

export const otpVerifyRequestSchema = z.object({
  phone: mainlandChinaPhoneSchema,
  challengeId: z.string().trim().min(1, 'challengeId 不能为空').optional(),
  code: otpCodeSchema,
  consentAccepted: z.boolean(),
  displayName: z.string().trim().min(1).max(30).optional(),
});

export const refreshSessionRequestSchema = z.object({
  refreshToken: z.string().trim().min(1, 'refreshToken 不能为空'),
});

export const wechatCallbackRequestSchema = z.object({
  code: z.string().trim().min(1, 'code 不能为空'),
  state: z.string().trim().optional(),
  consentAccepted: z.boolean(),
});

export type OtpSendRequest = z.infer<typeof otpSendRequestSchema>;
export type OtpVerifyRequest = z.infer<typeof otpVerifyRequestSchema>;
export type RefreshSessionRequest = z.infer<typeof refreshSessionRequestSchema>;
export type WechatCallbackRequest = z.infer<typeof wechatCallbackRequestSchema>;
