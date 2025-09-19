import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client with safer default settings
let queryClientInstance: QueryClient | null = null;

const getQueryClient = () => {
  if (!queryClientInstance) {
    queryClientInstance = new QueryClient({
      defaultOptions: {
        queries: {
          // OPTIMIZED: Longer cache times for stable data
          staleTime: 10 * 60 * 1000, // 10 minutes - data stays fresh longer
          gcTime: 30 * 60 * 1000, // 30 minutes - keep in memory longer
          retry: 3, // Better retry strategy
          retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          refetchOnWindowFocus: false, // Prevent unnecessary refetches
          refetchOnReconnect: 'always', // Only refetch on reconnect
          refetchOnMount: false, // Don't refetch if we have cached data
          networkMode: 'offlineFirst', // Use cache when network is slow
        },
        mutations: {
          retry: 2, // Retry mutations once more
          networkMode: 'offlineFirst',
        },
      },
    });
  }
  return queryClientInstance;
};

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Ensure we have React available
  if (!React) {
    console.error('React is not available in QueryProvider');
    return children as React.ReactElement;
  }

  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}