'use client';

import { useMutation, UseMutationOptions, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/types/api';

/**
 * Custom hook for API mutations with proper typing
 * Compatible with Next.js App Router and hydration
 */
export function useApiMutation<TData = unknown, TVariables = unknown>(
  options: UseMutationOptions<TData, ApiError, TVariables>
): UseMutationResult<TData, ApiError, TVariables> {
  return useMutation<TData, ApiError, TVariables>(options);
}

/**
 * Custom hook for optimistic API mutations
 * Compatible with Next.js App Router and hydration
 */
export function useOptimisticApiMutation<TData = unknown, TVariables = unknown, TContext = unknown>(
  options: UseMutationOptions<TData, ApiError, TVariables, TContext>
): UseMutationResult<TData, ApiError, TVariables, TContext> {
  return useMutation<TData, ApiError, TVariables, TContext>(options);
}

/**
 * Helper function to create optimistic update options
 * For use with useApiMutation
 */
export function createOptimisticOptions<TData = unknown, TVariables = unknown>(
  queryKey: unknown[],
  updateFn: (oldData: TData | undefined, variables: TVariables) => TData,
  options?: Omit<UseMutationOptions<TData, ApiError, TVariables, { previousData: TData | undefined }>, 'onMutate' | 'onError' | 'onSettled'>
): UseMutationOptions<TData, ApiError, TVariables, { previousData: TData | undefined }> {
  const queryClient = useQueryClient();
  
  return {
    ...options,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData<TData>(queryKey);
      
      // Optimistically update to the new value
      if (previousData) {
        queryClient.setQueryData(queryKey, updateFn(previousData, variables));
      }
      
      return { previousData };
    },
    onError: (_error, _variables, context) => {
      // If the mutation fails, roll back to the previous value
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      // Always invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey });
    }
  };
}
