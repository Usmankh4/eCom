'use client';

import React from 'react';

const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="product-card skeleton-card">
      <div className="card-image skeleton" style={{ height: '200px', width: '100%' }}></div>
      
      <div className="card-content">
        <div className="skeleton" style={{ height: '24px', width: '80%', marginBottom: '10px' }}></div>
        
        <div className="price-container">
          <div className="skeleton" style={{ height: '20px', width: '40%', marginBottom: '10px' }}></div>
        </div>
        
        <div className="product-rating">
          <div className="skeleton" style={{ height: '16px', width: '60%', marginBottom: '10px' }}></div>
        </div>
        
        <div className="skeleton" style={{ height: '36px', width: '100%', marginTop: '10px' }}></div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
