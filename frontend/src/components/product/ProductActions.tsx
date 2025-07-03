'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Product, PhoneVariant } from '@/types/product';
import QuantitySelector from './QuantitySelector';
import { useCart } from '@/hooks/useCart';

interface ProductActionsProps {
  product: Product;
  selectedVariant: PhoneVariant | null;
  quantity: number;
  setQuantity: (quantity: number) => void;
  className?: string;
}

/**
 * Component for product actions (add to cart, buy now)
 */
const ProductActions: React.FC<ProductActionsProps> = ({
  product,
  selectedVariant,
  quantity,
  setQuantity,
  className = ''
}) => {
  const router = useRouter();
  const { addToCart } = useCart();
  
  // Calculate max quantity based on stock
  const maxStock = selectedVariant ? selectedVariant.stock : product.stock || 10;
  
  // Handle quantity changes
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const increaseQuantity = () => {
    if (quantity < maxStock) {
      setQuantity(quantity + 1);
    }
  };
  
  // Handle add to cart
  const handleAddToCart = () => {
    const itemToAdd = {
      productId: product.id,
      name: product.name,
      price: selectedVariant ? selectedVariant.price : product.price,
      image: product.image,
      quantity: quantity,
      color: selectedVariant ? selectedVariant.color : null,
      storage: selectedVariant ? selectedVariant.storage : null,
      brand: product.brand
    };
    
    addToCart(itemToAdd);
  };
  
  // Handle buy now
  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };
  
  return (
    <div className={`product-actions ${className}`}>
      <div className="quantity-container">
        <span className="quantity-label">Quantity:</span>
        <QuantitySelector
          quantity={quantity}
          maxQuantity={maxStock}
          onDecrease={decreaseQuantity}
          onIncrease={increaseQuantity}
        />
      </div>
      
      <div className="action-buttons">
        <button 
          onClick={handleAddToCart}
          className="btn-add-to-cart"
        >
          Add To Cart
        </button>
        
        <button 
          onClick={handleBuyNow}
          className="btn-buy-now"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default ProductActions;
