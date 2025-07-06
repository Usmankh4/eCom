'use client';

import { useApiQuery, usePaginatedQuery } from './useApiQuery';
import { useApiMutation } from './useApiMutation';
import { Product, ProductsApiResponse } from '@/types/product';
import { HomePageApiResponse, BrandApiResponse, FlashDealsApiResponse } from '@/types/api';
import { 
  getHomePageData, 
  getProductsByBrand, 
  searchProducts, 
  getProductBySlug as clientGetProductBySlug,
  getRelatedProducts as clientGetRelatedProducts
} from '@/utils/api/productService';
import { getProductBySlug as serverGetProductBySlug, getRelatedProducts as serverGetRelatedProducts } from '@/utils/api/serverProductService';


export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...productKeys.lists(), { filters }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (slug: string) => [...productKeys.details(), slug] as const,
  homePage: () => ['homePage'] as const,
  brandProducts: (brand: string) => ['brandProducts', brand] as const,
  search: (query: string, filters: Record<string, unknown> = {}) => 
    ['search', query, filters] as const,
  related: (productId: string | number) => [...productKeys.all, 'related', productId.toString()] as const,
  featured: () => [...productKeys.all, 'featured'] as const,
  category: (category: string) => [...productKeys.all, 'category', category] as const,
};

/**
 * Hook to fetch homepage data
 * Compatible with Next.js App Router and hydration
 */
export function useHomePageData() {
  return useApiQuery<HomePageApiResponse>({
    queryKey: productKeys.homePage(),
    queryFn: () => getHomePageData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch products by brand with pagination
 * Compatible with Next.js App Router and hydration
 */
export function useBrandProducts(brand: string, page = 1, pageSize = 10) {
  return usePaginatedQuery<BrandApiResponse>(
    productKeys.brandProducts(brand),
    (p, ps) => getProductsByBrand(brand),
    page,
    pageSize,
    {
      enabled: !!brand,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
}

/**
 * Hook to search products with pagination
 * Compatible with Next.js App Router and hydration
 */
export function useProductSearch(query: string, page = 1, pageSize = 10, filters: Record<string, unknown> = {}) {
  return usePaginatedQuery<ProductsApiResponse>(
    productKeys.search(query, filters),
    (p, ps) => searchProducts(query, filters),
    page,
    pageSize,
    {
      enabled: !!query,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
}

/**
 * Hook to fetch a single product by slug
 * Compatible with Next.js App Router and hydration
 */
export function useProduct(slug: string) {
  // Use the appropriate function based on the environment
  const fetchFn = typeof window === 'undefined' 
    ? () => serverGetProductBySlug(slug)
    : () => clientGetProductBySlug(slug);

  return useApiQuery<Product>({
    queryKey: productKeys.detail(slug),
    queryFn: fetchFn,
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once on error
  });
}

/**
 * Hook to fetch a single product by slug with a different name
 * This is an alias for useProduct to maintain compatibility with component usage
 */
export function useProductBySlug(slug: string) {
  return useProduct(slug);
}

/**
 * Hook to fetch related products for a given product ID
 * Compatible with Next.js App Router and hydration
 */
export function useRelatedProducts(
  productId: string | number | undefined, 
  options: { enabled?: boolean } = {}
) {
  // Use the appropriate function based on the environment
  const fetchFn = typeof window === 'undefined'
    ? () => serverGetRelatedProducts(Number(productId))
    : () => clientGetRelatedProducts(String(productId));

  return useApiQuery<Product[]>({
    queryKey: productKeys.related(String(productId || '')),
    queryFn: fetchFn,
    enabled: !!productId && (options.enabled ?? true),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once on error
    ...options
  });
}
