import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      // Scoped to API tests only; mobile tests currently do not use `@` imports.
      // If mobile adds an app-local alias, split into per-app Vitest configs.
      '@': path.resolve(__dirname, 'apps/api'),
    },
  },
  test: {
    environment: 'node',
    restoreMocks: true,
    clearMocks: true,
    unstubEnvs: true,
  },
});
