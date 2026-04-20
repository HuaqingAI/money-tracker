import { ExpoConfig, ConfigContext } from 'expo/config';

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
    // 预留 Tamagui plugin 位置（Story 0.2 集成）
    // 微信 SDK — 安装 react-native-wechat-lib 后取消注释
    // ['react-native-wechat-lib', { appId: process.env.WECHAT_APP_ID || '' }],
  ],
  extra: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
  },
});
