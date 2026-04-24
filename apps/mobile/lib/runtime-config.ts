import Constants from 'expo-constants';

interface AppExtra {
  apiUrl?: string;
}

function readExtra(): AppExtra {
  const extra = Constants.expoConfig?.extra;
  if (!extra || typeof extra !== 'object') {
    return {};
  }

  return extra as AppExtra;
}

function normalizeApiUrl(apiUrl: string): string {
  return apiUrl.replace(/\/+$/, '');
}

export function getApiUrl(): string {
  const { apiUrl } = readExtra();
  return normalizeApiUrl(apiUrl ?? 'http://localhost:3000');
}

export function getAppVersion(): string {
  return Constants.expoConfig?.version ?? '0.1.0';
}
