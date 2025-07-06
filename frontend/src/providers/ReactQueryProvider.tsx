'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode, useState } from 'react';
import { ApiError } from '@/types/api';

type DevtoolsPosition = 'top' | 'bottom' | 'left' | 'right';

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  // This ensures the QueryClient is only created once per component lifecycle
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            // Important for SSR to avoid hydration mismatches
            refetchOnMount: true,
            retry: (failureCount, error) => {
              // Don't retry on 404s, but do retry on others
              if (error && typeof error === 'object' && 'status' in error) {
                const apiError = error as ApiError;
                if (apiError.status === 404) {
                  return false;
                }
              }
              return failureCount < 1; // Retry once for other errors
            },
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          position="bottom"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}
