/**
 * Sentry 服务端初始化配置
 *
 * 在 Next.js 服务端（Node.js runtime）启动时自动加载。
 * 配置在 instrumentation.ts 中通过 register() 调用。
 *
 * 环境变量：
 * - SENTRY_DSN: Sentry 项目 DSN（必填才会启用上报；未配置时 SDK 仍加载但不发送事件）
 * - SENTRY_ENVIRONMENT: 环境标识（production/staging/development）
 * - SENTRY_TRACES_SAMPLE_RATE: 性能追踪采样率（0.0-1.0）
 */
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
  // 生产环境不发送 PII（个人身份信息），遵守 PIPL 合规要求
  sendDefaultPii: false,
  // 仅在配置了 DSN 时启用上报
  enabled: Boolean(process.env.SENTRY_DSN),
  // Next.js 15 App Router 自动对 API Route 错误、请求 URL、HTTP 方法、状态码进行采集
});
