const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@money-tracker/shared', '@money-tracker/ui'],
  serverExternalPackages: ['pino', 'pino-roll', 'pino-pretty'],
};

/**
 * Sentry build 选项 — 处理 source map 上传等构建时任务。
 *
 * 仅在 SENTRY_AUTH_TOKEN + SENTRY_ORG + SENTRY_PROJECT 都配置时才实际上传，
 * 否则静默跳过（本地开发友好）。
 */
const sentryBuildOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT_API,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  tunnelRoute: undefined,
  sourcemaps: {
    // 未配置 auth token 时禁用 source map 上传，避免 CI 外报错
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  disableLogger: true,
};

module.exports = withSentryConfig(nextConfig, sentryBuildOptions);
