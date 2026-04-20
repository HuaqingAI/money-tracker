/**
 * Sentry Edge runtime 初始化配置
 *
 * Next.js Edge runtime（middleware 和 edge-enabled routes）使用。
 * 与 server 配置相同但在 edge 环境执行。
 */
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
  sendDefaultPii: false,
  enabled: Boolean(process.env.SENTRY_DSN),
});
