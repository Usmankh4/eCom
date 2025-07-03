/**
 * API response type definitions
 */

import { Product, Phone, Accessory } from './product';

// Generic API response with pagination
export interface PaginatedApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Error response from API
export interface ApiError {
  status: number;
  message: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

// Homepage API response
export interface HomePageApiResponse {
  flash_deals: {
    phones: Phone[];
    accessories: Accessory[];
  };
  new_arrivals: {
    phones: Phone[];
    accessories: Accessory[];
  };
  best_sellers: {
    phones: Phone[];
    accessories: Accessory[];
  };
}

// Flash deals API response
export interface FlashDealsApiResponse {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  discount_percentage: number;
  products: Product[];
  active: boolean;
}

// Search API response
export interface SearchApiResponse {
  query: string;
  results: {
    phones: Phone[];
    accessories: Accessory[];
  };
  total_count: number;
  filters?: {
    brands: string[];
    categories: string[];
    price_range: {
      min: number;
      max: number;
    };
  };
}

// Brand API response
export interface BrandApiResponse {
  brand: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  products: {
    phones: Phone[];
    accessories: Accessory[];
  };
  phones: Phone[];
  accessories: Accessory[];
  error?: string;
}
