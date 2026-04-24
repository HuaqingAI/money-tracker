import { QueryClient } from '@tanstack/react-query';

let queryClient: QueryClient | null = null;

export function getQueryClient(): QueryClient {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
        queries: {
          retry: false,
          staleTime: 30_000,
        },
      },
    });
  }

  return queryClient;
}
