import type { ConfigContext, ExpoConfig } from 'expo/config';

function resolveApiUrl(): string | undefined {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (process.env.EXPO_PACKAGER_HOSTNAME) {
    return `http://${process.env.EXPO_PACKAGER_HOSTNAME}:3000`;
  }

  return undefined;
}

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
  name: '\u4e86\u7136',
  slug: 'money-tracker',
  version: '0.1.0',
  orientation: 'portrait',
  scheme: 'money-tracker',
  platforms: ['ios', 'android'],
  plugins: ['expo-router', sentryPlugin],
  extra: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    apiUrl: resolveApiUrl(),
  },
});
