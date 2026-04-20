/**
 * Next.js Instrumentation Hook
 *
 * 在 Next.js 应用启动时执行，用于初始化 Sentry。
 * 根据 runtime (nodejs / edge) 加载对应配置文件。
 *
 * Refs:
 * - https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 * - https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

/**
 * 捕获 React Server Components 中的未处理错误并上报到 Sentry。
 */
export { captureRequestError as onRequestError } from '@sentry/nextjs';
