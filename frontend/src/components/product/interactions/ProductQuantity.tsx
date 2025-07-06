'use client';

import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

interface ProductQuantityProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  min?: number;
  max?: number;
}

export default function ProductQuantity({
  quantity,
  onQuantityChange,
  min = 1,
  max = 99
}: ProductQuantityProps) {
  const handleDecrement = () => {
    if (quantity > min) {
      onQuantityChange(quantity - 1);
    }
  };
  
  const handleIncrement = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= min && value <= max) {
      onQuantityChange(value);
    }
  };
  
  return (
    <div className="flex flex-col">
      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
        Quantity
      </label>
      <div className="quantity-container">
        <button
          type="button"
          className="quantity-button"
          onClick={handleDecrement}
          disabled={quantity <= min}
          aria-label="Decrease quantity"
        >
          <MinusIcon className="w-4 h-4" />
        </button>
        
        <input
          id="quantity"
          type="number"
          className="quantity-input"
          value={quantity}
          onChange={handleInputChange}
          min={min}
          max={max}
          aria-label="Product quantity"
        />
        
        <button
          type="button"
          className="quantity-button"
          onClick={handleIncrement}
          disabled={quantity >= max}
          aria-label="Increase quantity"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
      
      {max < 10 && (
        <p className="mt-1 text-sm text-red-600">
          Only {max} items left in stock
        </p>
      )}
    </div>
  );
}
