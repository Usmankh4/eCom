/**
 * Product mapping utility
 * 
 * This module provides functions to map API product data to frontend product models
 */

import { Product, Phone, Accessory, BaseProduct } from '@/types/product';
import { HomePageApiResponse, BrandApiResponse } from '@/types/api';

// Define a type for raw product data from API
type RawProductData = {
  id?: number | string;
  variant_id?: number | string;
  name?: string;
  title?: string;
  slug?: string;
  price?: string | number;
  original_price?: string | number;
  sale_price?: string | number;
  discount?: string;
  image_url?: string;
  image?: string;
  images?: Array<{ url: string; alt?: string }>;
  is_new?: boolean;
  is_bestseller?: boolean;
  rating?: number;
  brand?: string;
  category?: string;
  description?: string;
  type?: string;
  compatible_with?: string[];
  accessory_type?: string;
  storage?: string;
  color?: string;
  screen_size?: string;
  camera?: string;
  processor?: string;
  variants?: Array<any>;
};

/**
 * Maps API product data to frontend product models with consistent structure
 * 
 * @param products Array of product data from API
 * @returns Normalized product array with consistent properties
 */
export function mapProducts(products: RawProductData[] | null | undefined): Product[] {
  if (!Array.isArray(products)) {
    console.warn('mapProducts received invalid input - expected array');
    return [];
  }
  
  return products.map((product): Product => {
    // Handle potential missing fields with defaults
    const baseProduct: BaseProduct = {
      id: product.id || product.variant_id || 0,
      name: product.name || product.title || 'Unknown Product',
      slug: product.slug || `product-${product.id || 0}`,
      price: typeof product.price === 'string' ? parseFloat(product.price) : (product.price || 0),
      originalPrice: product.original_price ? 
        (typeof product.original_price === 'string' ? parseFloat(product.original_price) : product.original_price) : 
        undefined,
      salePrice: product.sale_price ? 
        (typeof product.sale_price === 'string' ? parseFloat(product.sale_price) : product.sale_price) : 
        undefined,
      discount: product.discount,
      image: product.image_url || product.image || product.images?.[0]?.url || '/images/placeholder.png',
      images: product.images ? product.images.map(img => ({
        url: img.url,
        alt: img.alt || ''
      })) : [],
      isNew: product.is_new || false,
      isBestSeller: product.is_bestseller || false,
      rating: product.rating,
      brand: product.brand,
      category: product.category,
      description: product.description,
    };

    // Determine product type and add specific fields
    if (product.type === 'accessory' || product.category === 'accessory') {
      // Map category string to valid Accessory category type
      const categoryMapping = (cat?: string): 'case' | 'charger' | 'screen_protector' | 'other' => {
        if (!cat) return 'other';
        
        const lowerCat = cat.toLowerCase();
        if (lowerCat.includes('case')) return 'case';
        if (lowerCat.includes('charger') || lowerCat.includes('power')) return 'charger';
        if (lowerCat.includes('screen') || lowerCat.includes('protector')) return 'screen_protector';
        return 'other';
      };
      
      return {
        ...baseProduct,
        type: 'accessory' as const,
        compatibleWith: product.compatible_with || [],
        category: categoryMapping(product.accessory_type || product.category),
      };
    } else {
      // Default to phone type
      return {
        ...baseProduct,
        type: 'phone' as const,
        storage: product.storage,
        color: product.color,
        screenSize: product.screen_size,
        camera: product.camera,
        processor: product.processor,
        variants: product.variants || [],
      };
    }
  });
}
