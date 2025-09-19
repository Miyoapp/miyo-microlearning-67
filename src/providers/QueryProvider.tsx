import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client with safer default settings
let queryClientInstance: QueryClient | null = null;

const getQueryClient = () => {
  if (!queryClientInstance) {
    queryClientInstance = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes
          gcTime: 10 * 60 * 1000, // 10 minutes 
          retry: 2, // Reduced retry count for safety
          refetchOnWindowFocus: false,
          refetchOnReconnect: true,
        },
        mutations: {
          retry: 1,
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