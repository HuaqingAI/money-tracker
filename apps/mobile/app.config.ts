import { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * Sentry Expo plugin 配置
 *
 * 在 EAS Build 过程中自动上传 source map 到 Sentry，
 * 使生产崩溃能定位到源码行。
 *
 * 需要的环境变量（仅在 EAS Build / CI 环境配置）:
 * - SENTRY_AUTH_TOKEN: Sentry API token（EAS secret）
 * - SENTRY_ORG: Sentry 组织标识
 * - SENTRY_PROJECT: Sentry 项目标识
 */
const sentryPlugin: [string, Record<string, string | undefined>] = [
  '@sentry/react-native/expo',
  {
    organization: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT_MOBILE,
    authToken: process.env.SENTRY_AUTH_TOKEN,
  },
];

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: '了然',
  slug: 'money-tracker',
  version: '0.1.0',
  orientation: 'portrait',
  scheme: 'money-tracker',
  platforms: ['ios', 'android'],
  newArchEnabled: false,
  plugins: [
    'expo-router',
    sentryPlugin,
    // 微信 SDK — 安装 react-native-wechat-lib 后取消注释
    // ['react-native-wechat-lib', { appId: process.env.WECHAT_APP_ID || '' }],
  ],
  extra: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
  },
});
