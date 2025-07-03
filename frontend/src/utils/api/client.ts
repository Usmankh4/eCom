/**
 * API Client with TypeScript support
 * 
 * This module provides a typed interface for making API calls to our backend
 * with proper error handling and response typing.
 */

import { ApiError } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  cache?: RequestCache;
}

/**
 * Enhanced fetch function with error handling and type support
 */
async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, cache = 'no-store', ...fetchOptions } = options;
  
  // Build URL with query parameters if provided
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Add cache busting for development if needed
  if (process.env.NODE_ENV === 'development' && cache === 'no-store') {
    url += url.includes('?') ? '&' : '?';
    url += `_t=${Date.now()}`;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      cache,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    // Handle non-2xx responses
    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        status: response.status,
        message: response.statusText,
      }));
      
      throw {
        status: response.status,
        message: errorData.message || response.statusText,
        detail: errorData.detail,
        errors: errorData.errors,
      };
    }

    // Parse JSON response
    return await response.json() as T;
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    
    // Handle network errors
    throw {
      status: 0,
      message: 'Network error',
      detail: (error as Error).message,
    };
  }
}

export default {
  /**
   * Make a GET request to the API
   */
  get<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    return fetchApi<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  },

  /**
   * Make a POST request to the API
   */
  post<T>(endpoint: string, data?: any, options: FetchOptions = {}): Promise<T> {
    return fetchApi<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * Make a PUT request to the API
   */
  put<T>(endpoint: string, data?: any, options: FetchOptions = {}): Promise<T> {
    return fetchApi<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * Make a PATCH request to the API
   */
  patch<T>(endpoint: string, data?: any, options: FetchOptions = {}): Promise<T> {
    return fetchApi<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * Make a DELETE request to the API
   */
  delete<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    return fetchApi<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  },
};
