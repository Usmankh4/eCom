/**
 * Product API Service
 * 
 * This module provides typed functions for interacting with product-related API endpoints.
 */

import apiClient from './client';
import { Product, Phone, Accessory, ProductsApiResponse } from '@/types/product';
import { HomePageApiResponse, BrandApiResponse, FlashDealsApiResponse } from '@/types/api';

/**
 * Get homepage data including featured products, new arrivals, and best sellers
 */
export async function getHomePageData(): Promise<HomePageApiResponse> {
  return apiClient.get<HomePageApiResponse>('/homepage/');
}

/**
 * Get active flash deals
 */
export async function getFlashDeals(): Promise<FlashDealsApiResponse[]> {
  return apiClient.get<FlashDealsApiResponse[]>('/promotions/active-flash-deals/');
}

/**
 * Get product details by slug
 */
export async function getProductBySlug(slug: string): Promise<Product> {
  return apiClient.get<Product>(`/products/${slug}/`);
}

/**
 * Get products by brand
 */
export async function getProductsByBrand(brand: string): Promise<BrandApiResponse> {
  return apiClient.get<BrandApiResponse>(`/brand/${brand}/`);
}

/**
 * Search products
 */
export async function searchProducts(
  query: string,
  filters?: {
    brand?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
  }
): Promise<ProductsApiResponse> {
  return apiClient.get<ProductsApiResponse>('/products/search/', {
    params: {
      q: query,
      ...filters,
    },
  });
}

/**
 * Get related products
 */
export async function getRelatedProducts(productId: string | number): Promise<Product[]> {
  return apiClient.get<Product[]>(`/products/${productId}/related/`);
}

/**
 * Get product variants
 */
export async function getProductVariants(productId: string | number): Promise<Phone> {
  return apiClient.get<Phone>(`/products/${productId}/variants/`);
}
