/**
 * Product API functions for fetching product data
 */

import { Product } from '@/types/product';
import { BrandApiResponse } from '@/types/api';

/**
 * Fetch all products
 * @returns Promise with array of products
 */
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch products:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

/**
 * Fetch a single product by ID
 * @param id Product ID
 * @returns Promise with product data
 */
export const fetchProductById = async (id: string | number): Promise<Product> => {
  try {
    const response = await fetch(`/api/products/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch product ${id}:`, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

/**
 * Fetch a single product by slug
 * @param slug Product slug
 * @returns Promise with product data or null if not found
 */
export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const url = `${apiUrl}/products/${slug}`;
    // Fetching product data from API
    
    const response = await fetch(url, {
      next: { 
        revalidate: 3600 
      }
    });
    
    if (!response.ok) {
      console.error(`Product API Error: ${response.status} - ${response.statusText}`);
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    // Product data received
    return data;
  } catch (error) {
    console.error(`Failed to fetch product with slug ${slug}:`, error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
};

/**
 * Fetch products by brand
 * @param brand Brand name
 * @returns Promise with array of products for the specified brand
 */
export const getProductsByBrand = async (brand: string): Promise<BrandApiResponse> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    // Fetching products by brand
    
    // Add cache-busting query parameter to bypass both browser and Next.js cache
    const timestamp = new Date().getTime();
    const response = await fetch(`${apiUrl}/products/brand/${brand}?t=${timestamp}`, {
      cache: 'no-store', // Disable Next.js cache
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        // No products found for brand (404 response)
        return { 
          brand,
          name: brand,
          slug: brand.toLowerCase().replace(/\s+/g, '-'),
          products: { phones: [], accessories: [] },
          phones: [],
          accessories: [],
          error: 'No products found for this brand' 
        };
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const products = await response.json();
    // Products data received
    return products;
  } catch (error) {
    console.error(`Failed to fetch products for brand ${brand}:`, error instanceof Error ? error.message : 'Unknown error');
    return { 
      brand,
      name: brand,
      slug: brand.toLowerCase().replace(/\s+/g, '-'),
      products: { phones: [], accessories: [] },
      phones: [],
      accessories: [],
      error: error instanceof Error ? error.message : 'Failed to fetch products' 
    };
  }
};
