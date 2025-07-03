/**
 * Product type definitions for the eCommerce application
 */

// Base product interface with common properties
export interface BaseProduct {
  id: number | string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  salePrice?: number;
  discount?: string | number;
  image: string;
  images?: ProductImage[];
  isNew?: boolean;
  isBestSeller?: boolean;
  rating?: number;
  brand?: string;
  category?: string;
  description?: string;
  inStock?: boolean;
  stock?: number;
  specifications?: Record<string, string | number>;
}

// Phone specific properties
export interface Phone extends BaseProduct {
  type: 'phone';
  storage?: string;
  color?: string;
  screenSize?: string;
  camera?: string;
  processor?: string;
  variants?: PhoneVariant[];
  colors?: { name: string; code?: string }[];
  storage_options?: { storage_amount: string; price: number }[];
  color_images?: { color_name: string; image: string }[];
}

// Phone variant (e.g. different color/storage options)
export interface PhoneVariant {
  id: number | string;
  color?: string;
  storage?: string;
  price: number;
  image?: string;
  inStock?: boolean;
}

// Accessory specific properties
export interface Accessory extends BaseProduct {
  type: 'accessory';
  compatibleWith?: string[];
  category?: 'case' | 'charger' | 'screen_protector' | 'other';
}

// Union type for all product types
export type Product = Phone | Accessory;

// Add these properties to the Product type to make them available on both Phone and Accessory
declare module '@/types/product' {
  interface BaseProduct {
    variants?: PhoneVariant[];
    colors?: { name: string; code?: string }[];
    storage_options?: { storage_amount: string; price: number }[];
    color_images?: { color_name: string; image: string }[];
  }
}

// Product image type
export interface ProductImage {
  url: string;
  alt: string;
  isPrimary?: boolean;
  color?: string;
  storage?: string;
  variantId?: number | string;
}

// Product card props for the ProductCard component
export interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
  className?: string;
}

// Product detail props for the ProductDetail component
export interface ProductDetailProps {
  product: Product;
  relatedProducts?: Product[];
}

// API response types
export interface ProductsApiResponse {
  phones?: Phone[];
  accessories?: Accessory[];
  flash_deals?: {
    phones: Phone[];
    accessories: Accessory[];
  };
  new_arrivals?: {
    phones: Phone[];
    accessories: Accessory[];
  };
  best_sellers?: {
    phones: Phone[];
    accessories: Accessory[];
  };
}

// Brand products response
export interface BrandProductsResponse {
  brand: string;
  products: Product[];
  phones?: Phone[];
  accessories?: Accessory[];
}
