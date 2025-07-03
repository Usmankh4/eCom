"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { z } from 'zod';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';

// Define cart item schema with Zod for runtime validation
const CartItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  name: z.string(),
  image: z.string(),
  price: z.number(),
  quantity: z.number(),
  color: z.string().optional(),
  storage: z.string().optional(),
  brand: z.string().optional(),
});

// Extract TypeScript type from Zod schema
type CartItem = z.infer<typeof CartItemSchema>;

// Define cart context type
interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  checkout: () => Promise<void>;
}

// Create cart context with default values
const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
  checkout: async () => {},
});

// Helper functions for local storage
const getCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const cart = localStorage.getItem('cart');
    const parsedCart = cart ? JSON.parse(cart) : [];
    
    // Validate cart items against schema
    return parsedCart.filter((item: unknown) => {
      try {
        CartItemSchema.parse(item);
        return true;
      } catch (error) {
        console.error('Invalid cart item:', error instanceof Error ? error.message : 'Invalid item format');
        return false;
      }
    });
  } catch (error) {
    console.error('Failed to load cart from storage:', error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
};

const saveCartToStorage = (cart: CartItem[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('cart', JSON.stringify(cart));
};

// Cart provider props
interface CartProviderProps {
  children: ReactNode;
}

// Cart provider component
export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const router = useRouter();
  
  // Initialize cart from localStorage
  useEffect(() => {
    setItems(getCartFromStorage());
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  // Add item to cart
  const addItem = (item: CartItem) => {
    setItems(currentItems => {
      // Check if item already exists
      const existingItemIndex = currentItems.findIndex(
        existingItem => existingItem.id === item.id
      );

      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex].quantity += item.quantity;
        return updatedItems;
      } else {
        // Add new item
        return [...currentItems, item];
      }
    });
  };

  // Update item quantity
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // Remove item from cart
  const removeItem = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  };

  // Clear cart
  const clearCart = () => {
    setItems([]);
  };

  // Calculate total items
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate total price
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Checkout function
  const checkout = async () => {
    try {
      // Initialize Stripe
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '');
      
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      // Create checkout session on your backend
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        }),
      });

      const { sessionId } = await response.json();

      // Redirect to Stripe checkout
      const result = await stripe.redirectToCheckout({
        sessionId,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Checkout failed:', error instanceof Error ? error.message : 'Unknown error');
      alert('Checkout failed. Please try again.');
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalItems,
        totalPrice,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};

export type { CartItem };
