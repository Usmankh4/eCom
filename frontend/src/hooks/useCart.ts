'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export interface CartItem {
  id: string;
  productId: number | string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color?: string | null;
  storage?: string | null;
  brand?: string;
}

export interface UseCartReturn {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  isError: boolean;
}

// Cart query key for React Query
const cartKey = ['cart'];

/**
 * Helper function to load cart from localStorage
 */
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
};

/**
 * Helper function to save cart to localStorage
 */
const saveCartToStorage = (cart: CartItem[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error instanceof Error ? error.message : 'Unknown error');
  }
};

/**
 * Custom hook for cart functionality using React Query
 * Handles adding, removing, updating items and persisting to localStorage
 * Compatible with Next.js App Router and hydration
 */
export const useCart = (): UseCartReturn => {
  const queryClient = useQueryClient();
  
  // Query to get cart data
  const { data: cart = [], isLoading, isError } = useQuery<CartItem[]>({
    queryKey: cartKey,
    queryFn: loadCartFromStorage,
    // Don't refetch on window focus since we're using localStorage
    refetchOnWindowFocus: false,
    // Persist cart data between page navigations
    staleTime: Infinity,
  });
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);
  
  // Mutation to add item to cart
  const addToCartMutation = useMutation({
    mutationFn: async (item: Omit<CartItem, 'id'>) => {
      const currentCart = queryClient.getQueryData<CartItem[]>(cartKey) || [];
      
      // Generate a unique ID for the item
      const itemId = `${item.productId}_${item.color || ''}_${item.storage || ''}`;
      
      // Check if item already exists in cart
      const existingIndex = currentCart.findIndex(cartItem => 
        cartItem.productId === item.productId && 
        cartItem.color === item.color && 
        cartItem.storage === item.storage
      );
      
      let newCart: CartItem[];
      
      if (existingIndex !== -1) {
        // Update quantity if item exists
        newCart = [...currentCart];
        newCart[existingIndex].quantity += item.quantity;
      } else {
        // Add new item if it doesn't exist
        newCart = [...currentCart, { ...item, id: itemId }];
      }
      
      return newCart;
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData(cartKey, newCart);
    },
  });
  
  // Mutation to remove item from cart
  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const currentCart = queryClient.getQueryData<CartItem[]>(cartKey) || [];
      return currentCart.filter(item => item.id !== itemId);
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData(cartKey, newCart);
    },
  });
  
  // Mutation to update item quantity
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (quantity < 1) throw new Error('Quantity must be at least 1');
      
      const currentCart = queryClient.getQueryData<CartItem[]>(cartKey) || [];
      return currentCart.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      );
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData(cartKey, newCart);
    },
  });
  
  // Mutation to clear cart
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      return [] as CartItem[];
    },
    onSuccess: () => {
      queryClient.setQueryData(cartKey, []);
    },
  });
  
  // Calculate total items and price
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  return {
    cart,
    addToCart: (item) => addToCartMutation.mutate(item),
    removeFromCart: (itemId) => removeFromCartMutation.mutate(itemId),
    updateQuantity: (itemId, quantity) => updateQuantityMutation.mutate({ itemId, quantity }),
    clearCart: () => clearCartMutation.mutate(),
    totalItems,
    totalPrice,
    isLoading,
    isError
  };
};
