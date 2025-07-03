'use client';

import React from 'react';

interface QuantitySelectorProps {
  quantity: number;
  maxQuantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  className?: string;
}

/**
 * Reusable quantity selector component with increment/decrement buttons
 */
const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  maxQuantity,
  onDecrease,
  onIncrease,
  className = ''
}) => {
  return (
    <div className={`quantity-selector ${className}`}>
      <button 
        onClick={onDecrease}
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
        className="quantity-btn"
      >
        -
      </button>
      
      <span className="quantity-value">{quantity}</span>
      
      <button 
        onClick={onIncrease}
        disabled={quantity >= maxQuantity}
        aria-label="Increase quantity"
        className="quantity-btn"
      >
        +
      </button>
    </div>
  );
};

export default QuantitySelector;
