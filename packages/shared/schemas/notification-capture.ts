import { z } from 'zod';

export const notificationPlatformSchema = z.enum([
  'alipay',
  'wechat',
  'icbc',
  'cmb',
  'ccb',
  'bank',
]);

export const notificationTimeStrategySchema = z.enum([
  'posted-at',
  'yyyy-mm-dd hh:mm',
  'mm-dd hh:mm',
  'hh:mm',
]);

export const notificationPatternRuleSchema = z.object({
  id: z.string().min(1),
  platform: notificationPlatformSchema,
  packageNames: z.array(z.string().min(1)),
  titleKeywords: z.array(z.string().min(1)),
  textPattern: z.string().min(1),
  timeStrategy: notificationTimeStrategySchema,
});

export const notificationRuleSetSchema = z.object({
  version: z.string().min(1),
  updatedAt: z.string().datetime(),
  rules: z.array(notificationPatternRuleSchema).min(1),
});

export const notificationEnvelopeSchema = z.object({
  packageName: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  text: z.string().min(1),
  postedAt: z.string().datetime().optional(),
});

export const notificationCaptureSchema = z.object({
  amountCents: z.number().int().positive(),
  merchantName: z.string().min(1),
  transactionTime: z.string().datetime(),
  platform: notificationPlatformSchema,
});

export const notificationCaptureUploadSchema = z.object({
  capture: notificationCaptureSchema,
  capturedAt: z.string().datetime().optional(),
  deviceId: z.string().min(1).optional(),
});

export const notificationCaptureResultSchema = z.object({
  duplicate: z.boolean(),
  normalized: notificationCaptureSchema,
  receivedAt: z.string().datetime(),
});

export type NotificationPlatform = z.infer<typeof notificationPlatformSchema>;
export type NotificationTimeStrategy = z.infer<
  typeof notificationTimeStrategySchema
>;
export type NotificationPatternRule = z.infer<
  typeof notificationPatternRuleSchema
>;
export type NotificationRuleSet = z.infer<typeof notificationRuleSetSchema>;
export type NotificationEnvelope = z.infer<typeof notificationEnvelopeSchema>;
export type NotificationCapture = z.infer<typeof notificationCaptureSchema>;
export type NotificationCaptureUpload = z.infer<
  typeof notificationCaptureUploadSchema
>;
export type NotificationCaptureResult = z.infer<
  typeof notificationCaptureResultSchema
>;
