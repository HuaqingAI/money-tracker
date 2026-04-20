/**
 * Sentry React Native 初始化
 *
 * 应用启动时调用 `initSentry()`，之后可使用 `Sentry.wrap()` 包裹根组件。
 *
 * 环境变量（通过 Expo app.config.ts extra 注入）:
 * - EXPO_PUBLIC_SENTRY_DSN: Sentry 项目 DSN
 * - EXPO_PUBLIC_SENTRY_ENVIRONMENT: 环境标识
 * - EXPO_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: 性能采样率（默认 0.1）
 *
 * Source map 上传通过 Sentry Expo plugin 在 EAS Build 过程中完成，
 * 见 apps/mobile/app.config.ts 中的 plugins 配置。
 */
import * as Sentry from '@sentry/react-native';

export function initSentry(): void {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  // 未配置 DSN 时跳过初始化（本地开发友好）
  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT ?? 'development',
    tracesSampleRate: Number(
      process.env.EXPO_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? '0.1',
    ),
    // 自动捕获 JS 未处理异常和 native crash，包含堆栈和设备上下文
    enableAutoSessionTracking: true,
    // 不发送 PII 以符合 PIPL 合规要求
    sendDefaultPii: false,
    // 禁用 debug 模式避免生产环境大量日志
    debug: false,
  });
}

export { Sentry };
