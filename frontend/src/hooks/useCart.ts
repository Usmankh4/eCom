'use client';

import { useState, useEffect } from 'react';

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
}

/**
 * Custom hook for cart functionality
 * Handles adding, removing, updating items and persisting to localStorage
 */
export const useCart = (): UseCartReturn => {
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error instanceof Error ? error.message : 'Unknown error');
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error instanceof Error ? error.message : 'Unknown error');
    }
  }, [cart]);
  
  // Add item to cart
  const addToCart = (item: Omit<CartItem, 'id'>) => {
    setCart(prevCart => {
      // Generate a unique ID for the item
      const itemId = `${item.productId}_${item.color || ''}_${item.storage || ''}`;
      
      // Check if item already exists in cart
      const existingIndex = prevCart.findIndex(cartItem => 
        cartItem.productId === item.productId && 
        cartItem.color === item.color && 
        cartItem.storage === item.storage
      );
      
      if (existingIndex !== -1) {
        // Update quantity if item exists
        const updatedCart = [...prevCart];
        updatedCart[existingIndex].quantity += item.quantity;
        return updatedCart;
      } else {
        // Add new item if it doesn't exist
        return [...prevCart, { ...item, id: itemId }];
      }
    });
  };
  
  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };
  
  // Update item quantity
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setCart(prevCart => {
      return prevCart.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      );
    });
  };
  
  // Clear cart
  const clearCart = () => {
    setCart([]);
  };
  
  // Calculate total items and price
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  };
};
