import { Product, ProductsApiResponse } from '@/types/product';
import { ApiError } from '@/types/api';

// Create ApiError class for server-side use
class ApiErrorImpl extends Error implements ApiError {
  status: number;
  data?: any;
  
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Base API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Server-side product API service
 * These functions are meant to be used in Next.js Server Components or getServerSideProps
 * They don't rely on fetch's auto-caching since we'll use React Query for that
 */

/**
 * Fetch all products with optional filtering
 * @param params Query parameters for filtering, pagination, etc.
 */
export async function getProducts(params?: Record<string, string | number>): Promise<ProductsApiResponse> {
  try {
    // Build query string from params
    const queryString = params 
      ? '?' + new URLSearchParams(
          Object.entries(params).map(([key, value]) => [key, String(value)])
        ).toString()
      : '';
    
    const response = await fetch(`${API_URL}/products${queryString}`, {
      // No cache to ensure fresh data, React Query will handle caching
      cache: 'no-store',
      // Next.js 13+ tags for revalidation
      next: { tags: ['products'] }
    });
    
    if (!response.ok) {
      throw new ApiErrorImpl(
        response.statusText,
        response.status,
        await response.text()
      );
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

/**
 * Fetch a single product by slug
 * @param slug Product slug
 */
export async function getProductBySlug(slug: string): Promise<Product> {
  try {
    // First try to fetch as a phone
    let response = await fetch(`${API_URL}/phones/${slug}/`, {
      cache: 'no-store',
      next: { tags: [`product-${slug}`] }
    });
    
    // If phone not found, try as an accessory
    if (response.status === 404) {
      response = await fetch(`${API_URL}/accessories/${slug}/`, {
        cache: 'no-store',
        next: { tags: [`product-${slug}`] }
      });
    }
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Error fetching product ${slug}:`, response.status, errorData);
      throw new ApiErrorImpl(
        response.status === 404 ? 'Product not found' : response.statusText,
        response.status,
        errorData
      );
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching product with slug ${slug}:`, error);
    throw error;
  }
}

/**
 * Fetch products by category
 * @param categorySlug Category slug
 * @param params Additional query parameters
 */
export async function getProductsByCategory(
  categorySlug: string,
  params?: Record<string, string | number>
): Promise<ProductsApiResponse> {
  try {
    // Build query string from params
    const queryParams = params ? { ...params } : {};
    const queryString = '?' + new URLSearchParams(
      Object.entries(queryParams).map(([key, value]) => [key, String(value)])
    ).toString();
    
    const response = await fetch(`${API_URL}/categories/${categorySlug}/products${queryString}`, {
      cache: 'no-store',
      next: { tags: [`category-${categorySlug}`] }
    });
    
    if (!response.ok) {
      throw new ApiErrorImpl(
        response.statusText,
        response.status,
        await response.text()
      );
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching products for category ${categorySlug}:`, error);
    throw error;
  }
}

/**
 * Fetch featured products
 * @param limit Number of products to fetch
 */
export async function getFeaturedProducts(limit: number = 4): Promise<Product[]> {
  try {
    const response = await fetch(`${API_URL}/products/featured?limit=${limit}`, {
      cache: 'no-store',
      next: { tags: ['featured-products'] }
    });
    
    if (!response.ok) {
      throw new ApiErrorImpl(
        response.statusText,
        response.status,
        await response.text()
      );
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
}

/**
 * Fetch related products for a given product
 * @param productId Product ID
 * @param limit Number of related products to fetch
 */
export async function getRelatedProducts(productId: number | string, limit: number = 4): Promise<Product[]> {
  try {
    // Add timestamp for cache busting
    const timestamp = new Date().getTime();
    
    // Try to fetch related products from the brand endpoint first
    // This endpoint should return products from the same brand
    const product = await getProductById(productId);
    if (product && product.brand) {
      const brandResponse = await fetch(`${API_URL}/products/brand/${product.brand.toLowerCase()}/?_t=${timestamp}&limit=${limit}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (brandResponse.ok) {
        const brandData = await brandResponse.json();
        // Filter out the current product and limit the results
        const relatedProducts = Array.isArray(brandData) ? 
          brandData.filter(item => item.id !== productId).slice(0, limit) : 
          [];
          
        if (relatedProducts.length > 0) {
          return relatedProducts;
        }
      }
    }
    
    // Fallback to featured products if we can't get related products by brand
    return await getFeaturedProducts(limit);
  } catch (error) {
    console.error('Error in getRelatedProducts:', error);
    // Return empty array instead of throwing to avoid breaking the UI
    return [];
  }
}

/**
 * Fetch a product by ID
 * @param productId Product ID
 */
export async function getProductById(productId: number | string): Promise<Product | null> {
  try {
    // Add timestamp for cache busting
    const timestamp = new Date().getTime();
    
    // Try phones endpoint first
    let response = await fetch(`${API_URL}/phones/${productId}/?_t=${timestamp}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
    // If not found, try accessories endpoint
    if (response.status === 404) {
      response = await fetch(`${API_URL}/accessories/${productId}/?_t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
    }
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching product with ID ${productId}:`, error);
    return null;
  }
}
