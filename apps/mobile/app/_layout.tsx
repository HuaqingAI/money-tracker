import { UIProvider } from '@money-tracker/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { getQueryClient } from '../lib/query-client';
import { initSentry, Sentry } from '../lib/sentry';
import { hydrateAuthStore } from '../stores/auth-store';

function RootLayout() {
  useEffect(() => {
    initSentry();
    void hydrateAuthStore();
  }, []);

  return (
    <QueryClientProvider client={getQueryClient()}>
      <UIProvider defaultTheme="light">
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(app)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </UIProvider>
    </QueryClientProvider>
  );
}

export default Sentry.wrap(RootLayout);
