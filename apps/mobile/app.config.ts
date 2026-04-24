import type { ConfigContext, ExpoConfig } from 'expo/config';

const sentryPlugin: [string, Record<string, string | undefined>] = [
  '@sentry/react-native/expo',
  {
    authToken: process.env.SENTRY_AUTH_TOKEN,
    organization: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT_MOBILE,
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
  plugins: [
    'expo-router',
    sentryPlugin,
  ],
  extra: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    supabaseUrl: process.env.SUPABASE_URL,
  },
});
