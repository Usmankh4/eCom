'use client';

import React from 'react';
import { Product } from '@/types/product';
import { formatPrice } from '@/utils/formatters';

interface ProductInfoProps {
  product: Product;
  currentPrice: number;
  className?: string;
}

/**
 * Component for displaying product information (name, price, description, specs)
 */
const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  currentPrice,
  className = ''
}) => {
  return (
    <div className={`product-info ${className}`}>
      <h2 className="product-title">{product.name}</h2>
      
      <div className="product-price">
        <h3>{formatPrice(currentPrice)}</h3>
      </div>
      
      {/* Product Description */}
      {product.description && (
        <div className="product-description">
          <h3>Description</h3>
          <p>{product.description}</p>
        </div>
      )}
      
      {/* Product Specifications */}
      {product.specifications && (
        <div className="product-specifications">
          <h3>Specifications</h3>
          <ul className="specs-list">
            {Object.entries(product.specifications).map(([key, value]) => (
              <li key={key} className="spec-item">
                <span className="spec-label">{key}:</span>
                <span className="spec-value">{value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Brand information if available */}
      {product.brand && (
        <div className="product-brand">
          <h3>Brand</h3>
          <p>{product.brand}</p>
        </div>
      )}
    </div>
  );
};

export default ProductInfo;
