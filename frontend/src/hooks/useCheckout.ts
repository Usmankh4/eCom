'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CartItem } from './useCart';

interface CheckoutData {
  items: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  totalAmount: number;
}

interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

type PaymentMethod = 'credit_card' | 'paypal' | 'stripe';

interface OrderResponse {
  orderId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  estimatedDelivery?: string;
}

interface UseCheckoutReturn {
  submitOrder: (data: CheckoutData) => void;
  isLoading: boolean; // For backward compatibility
  isPending: boolean; // New preferred property name
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
  data?: OrderResponse;
}


export const useCheckout = (): UseCheckoutReturn => {
  const queryClient = useQueryClient();
  
  // Simulated API call - replace with actual API endpoint
  const submitOrderToApi = async (data: CheckoutData): Promise<OrderResponse> => {
    // This would be a real API call in production
    console.log('Submitting order:', data);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate successful response
    return {
      orderId: `ORD-${Date.now()}`,
      status: 'processing',
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  };
  
  const { 
    mutate: submitOrder, 
    isPending, 
    isError, 
    error, 
    isSuccess, 
    data 
  } = useMutation({
    mutationFn: submitOrderToApi,
    onSuccess: () => {
      // Clear the cart after successful order
      queryClient.setQueryData(['cart'], []);
      
      // Invalidate any relevant queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });
  
  return {
    submitOrder,
    isLoading: isPending, // For backward compatibility
    isPending,           // New preferred property name
    isError,
    error: error as Error | null,
    isSuccess,
    data
  };
};
