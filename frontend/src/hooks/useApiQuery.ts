'use client';

import { 
  QueryKey, 
  useQuery, 
  useQueryClient,
  UseQueryOptions,
  QueryFunction,
  QueryClient,
  UseQueryResult
} from '@tanstack/react-query';
import { ApiError } from '@/types/api';

// Default options for queries that work well with SSR
const defaultQueryOptions = {
  staleTime: 60 * 1000, // 1 minute
  refetchOnWindowFocus: false,
  refetchOnMount: true,
  retry: (failureCount: number, error: unknown) => {
    if (error && typeof error === 'object' && 'status' in error) {
      const apiError = error as ApiError;
      if (apiError.status === 404) {
        return false;
      }
    }
    return failureCount < 2;
  },
};

type QueryResult<TData> = UseQueryResult<TData, ApiError>;

/**
 * Custom hook for making API queries with React Query
 * Includes default error handling and type safety
 * Compatible with Next.js App Router and hydration
 */
function useApiQuery<TData = unknown>(
  options: UseQueryOptions<TData, ApiError, TData, QueryKey>
): QueryResult<TData> {
  return useQuery<TData, ApiError, TData, QueryKey>({
    ...defaultQueryOptions,
    ...options,
  });
}

/**
 * Hook for paginated queries
 * Compatible with Next.js App Router and hydration
 */
function usePaginatedQuery<TData = unknown>(
  baseQueryKey: QueryKey,
  queryFn: (page: number, pageSize: number) => Promise<TData>,
  page: number,
  pageSize: number,
  options: Omit<UseQueryOptions<TData, ApiError, TData, QueryKey>, 'queryKey' | 'queryFn'> = {}
): QueryResult<TData> {
  const queryClient = useQueryClient();
  
  // Get the query key for the current page
  const queryKey = [...baseQueryKey, page, pageSize];
  
  // Use the base useQuery hook with proper types
  return useQuery<TData, ApiError, TData, QueryKey>({
    queryKey,
    queryFn: () => queryFn(page, pageSize),
    ...defaultQueryOptions,
    // Enable SWR-like behavior for pagination
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export { useApiQuery, usePaginatedQuery, useQueryClient };
