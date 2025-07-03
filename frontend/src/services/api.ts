/**
 * API service for handling all data fetching operations
 */

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper function for API requests
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

// Product API functions
export const productAPI = {
  /**
   * Get all products with optional pagination
   */
  getProducts: async (page = 1, limit = 10) => {
    return fetchAPI(`/products/?page=${page}&limit=${limit}`);
  },
  
  /**
   * Get a single product by ID
   */
  getProductById: async (id: string | number) => {
    return fetchAPI(`/products/${id}/`);
  },
  
  /**
   * Get featured products
   */
  getFeaturedProducts: async (limit = 8) => {
    return fetchAPI(`/products/featured/?limit=${limit}`);
  },
  
  /**
   * Get products by category
   */
  getProductsByCategory: async (category: string, page = 1, limit = 10) => {
    return fetchAPI(`/products/category/${category}/?page=${page}&limit=${limit}`);
  },
  
  /**
   * Search products
   */
  searchProducts: async (query: string, page = 1, limit = 10) => {
    return fetchAPI(`/products/search/?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  },
};

// Brand API functions
export const brandAPI = {
  /**
   * Get all brands
   */
  getBrands: async () => {
    return fetchAPI('/brands/');
  },
  
  /**
   * Get a single brand by slug
   */
  getBrandBySlug: async (slug: string) => {
    return fetchAPI(`/brands/${slug}/`);
  },
  
  /**
   * Get products by brand
   */
  getProductsByBrand: async (brand: string, page = 1, limit = 10) => {
    return fetchAPI(`/products/brand/${brand}/?page=${page}&limit=${limit}`);
  },
};

// Category API functions
export const categoryAPI = {
  /**
   * Get all categories
   */
  getCategories: async () => {
    return fetchAPI('/categories/');
  },
};

// Order API functions
export const orderAPI = {
  /**
   * Create a new order
   */
  createOrder: async (orderData: any) => {
    return fetchAPI('/orders/', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },
  
  /**
   * Get order by ID
   */
  getOrderById: async (id: string) => {
    return fetchAPI(`/orders/${id}/`);
  },
};

// User API functions
export const userAPI = {
  /**
   * Get user profile
   */
  getUserProfile: async (token: string) => {
    return fetchAPI('/users/profile/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  
  /**
   * Update user profile
   */
  updateUserProfile: async (userData: any, token: string) => {
    return fetchAPI('/users/profile/', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
  },
};

// Auth API functions
export const authAPI = {
  /**
   * Login user
   */
  login: async (email: string, password: string) => {
    return fetchAPI('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  /**
   * Register user
   */
  register: async (userData: any) => {
    return fetchAPI('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  /**
   * Refresh token
   */
  refreshToken: async (refreshToken: string) => {
    return fetchAPI('/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
  },
};
