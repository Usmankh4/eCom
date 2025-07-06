'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ApiError } from '@/types/api';

export interface WishlistItem {
  id: string;
  productId: number | string;
  name: string;
  price: number;
  image: string;
  addedAt: string;
  slug?: string;
}

interface UseWishlistReturn {
  wishlist: WishlistItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  addToWishlist: (product: Omit<WishlistItem, 'id' | 'addedAt'>) => void;
  removeFromWishlist: (productId: string | number) => void;
  isInWishlist: (productId: string | number) => boolean;
  clearWishlist: () => void;
}

// Wishlist query key for React Query
const wishlistKey = ['wishlist'];

/**
 * Helper function to load wishlist from localStorage
 */
const loadWishlistFromStorage = (): WishlistItem[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const savedWishlist = localStorage.getItem('wishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  } catch (error) {
    console.error('Failed to load wishlist from localStorage:', error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
};

/**
 * Helper function to save wishlist to localStorage
 */
const saveWishlistToStorage = (wishlist: WishlistItem[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  } catch (error) {
    console.error('Failed to save wishlist to localStorage:', error instanceof Error ? error.message : 'Unknown error');
  }
};

/**
 * Custom hook for wishlist functionality using React Query
 * Handles adding, removing items and persisting to localStorage
 * Compatible with Next.js App Router and hydration
 */
export const useWishlist = (): UseWishlistReturn => {
  const queryClient = useQueryClient();
  
  // Query to get wishlist data
  const { data: wishlist = [], isLoading, isError, error } = useQuery<WishlistItem[], ApiError>({
    queryKey: wishlistKey,
    queryFn: loadWishlistFromStorage,
    // Don't refetch on window focus since we're using localStorage
    refetchOnWindowFocus: false,
    // Persist wishlist data between page navigations
    staleTime: Infinity,
  });
  
  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    saveWishlistToStorage(wishlist);
  }, [wishlist]);
  
  // Mutation to add item to wishlist
  const addToWishlistMutation = useMutation({
    mutationFn: async (product: Omit<WishlistItem, 'id' | 'addedAt'>) => {
      const currentWishlist = queryClient.getQueryData<WishlistItem[]>(wishlistKey) || [];
      
      // Check if product already exists in wishlist
      const exists = currentWishlist.some(item => item.productId === product.productId);
      
      if (exists) {
        return currentWishlist; // No change needed
      }
      
      // Add new item to wishlist
      const newItem: WishlistItem = {
        ...product,
        id: `wish_${product.productId}`,
        addedAt: new Date().toISOString()
      };
      
      return [...currentWishlist, newItem];
    },
    onSuccess: (newWishlist) => {
      queryClient.setQueryData(wishlistKey, newWishlist);
    },
  });
  
  // Mutation to remove item from wishlist
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string | number) => {
      const currentWishlist = queryClient.getQueryData<WishlistItem[]>(wishlistKey) || [];
      return currentWishlist.filter(item => item.productId !== productId);
    },
    onSuccess: (newWishlist) => {
      queryClient.setQueryData(wishlistKey, newWishlist);
    },
  });
  
  // Mutation to clear wishlist
  const clearWishlistMutation = useMutation({
    mutationFn: async () => {
      return [] as WishlistItem[];
    },
    onSuccess: () => {
      queryClient.setQueryData(wishlistKey, []);
    },
  });
  
  // Check if a product is in the wishlist
  const isInWishlist = (productId: string | number): boolean => {
    return wishlist.some(item => item.productId === productId);
  };
  
  return {
    wishlist,
    isLoading,
    isError,
    error: error as Error | null,
    addToWishlist: (product) => addToWishlistMutation.mutate(product),
    removeFromWishlist: (productId) => removeFromWishlistMutation.mutate(productId),
    isInWishlist,
    clearWishlist: () => clearWishlistMutation.mutate()
  };
};
