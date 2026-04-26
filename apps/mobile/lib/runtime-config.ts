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

function getExpoHostUri(): string | null {
  return (
    Constants.expoConfig?.hostUri
    ?? (Constants as unknown as { manifest2?: { extra?: { expoClient?: { hostUri?: string } } } })
      .manifest2?.extra?.expoClient?.hostUri
    ?? (Constants as unknown as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost
    ?? null
  );
}

export function normalizeLocalhostUrl(url: string): string {
  const hostUri = getExpoHostUri();
  if (!hostUri || !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url)) {
    return url;
  }

  const [host] = hostUri.split(':');
  if (!host) {
    return url;
  }

  return url.replace(/(localhost|127\.0\.0\.1)/i, host);
}

export function getApiUrl(): string {
  const { apiUrl } = readExtra();
  return normalizeLocalhostUrl(normalizeApiUrl(apiUrl ?? 'http://localhost:3000'));
}

export function getAppVersion(): string {
  return Constants.expoConfig?.version ?? '0.1.0';
}
