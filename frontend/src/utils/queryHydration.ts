import { dehydrate, QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

/**
 * Creates a singleton QueryClient for server components
 * This ensures we use the same QueryClient instance across the server component tree
 */
export const getQueryClient = cache(() => new QueryClient({
  defaultOptions: {
    queries: {
      // Server-specific defaults
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: false,
      staleTime: 60 * 1000, // 1 minute
    },
  },
}));

/**
 * Prefetches data for a specific query on the server
 * Use this in Next.js Server Components or page.tsx files
 * 
 * @example
 * // In a page.tsx or layout.tsx file:
 * export default async function ProductPage({ params }) {
 *   // Prefetch product data
 *   const dehydratedState = await prefetchQuery(
 *     ['product', params.slug],
 *     () => getProductBySlug(params.slug)
 *   );
 *   
 *   return (
 *     <HydrationBoundary state={dehydratedState}>
 *       <ProductDetails slug={params.slug} />
 *     </HydrationBoundary>
 *   );
 * }
 */
export async function prefetchQuery<TData>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  options?: {
    staleTime?: number;
  }
): Promise<any> {
  const queryClient = getQueryClient();
  
  // Prefetch the query
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime,
  });
  
  // Dehydrate the cache
  return dehydrate(queryClient);
}

/**
 * Prefetches data for multiple queries on the server
 * 
 * @example
 * // In a page.tsx or layout.tsx file:
 * export default async function HomePage() {
 *   // Prefetch multiple queries
 *   const dehydratedState = await prefetchQueries([
 *     {
 *       queryKey: ['products', { featured: true }],
 *       queryFn: () => getFeaturedProducts(),
 *     },
 *     {
 *       queryKey: ['categories'],
 *       queryFn: () => getCategories(),
 *     }
 *   ]);
 *   
 *   return (
 *     <HydrationBoundary state={dehydratedState}>
 *       <HomePage />
 *     </HydrationBoundary>
 *   );
 * }
 */
export async function prefetchQueries(
  queries: Array<{
    queryKey: unknown[];
    queryFn: () => Promise<unknown>;
    staleTime?: number;
  }>
): Promise<any> {
  const queryClient = getQueryClient();
  
  // Prefetch all queries in parallel
  await Promise.all(
    queries.map(({ queryKey, queryFn, staleTime }) =>
      queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime,
      })
    )
  );
  
  // Dehydrate the cache
  return dehydrate(queryClient);
}
