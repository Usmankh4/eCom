'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';

interface BrandProductsProps {
  brand: string;
  initialProducts?: Product[];
}

export default function BrandProducts({ brand, initialProducts = [] }: BrandProductsProps) {
  const [products] = useState<Product[]>(initialProducts);
  const displayBrand = brand ? brand.toUpperCase() : '';

  if (!initialProducts?.length) {
    return (
      <div className="page-container">
        <div className="PhoneTitle">
          <h2>{displayBrand}</h2>
          <p>No products found for {displayBrand}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="PhoneTitle">
        <h2>{displayBrand}</h2>
        <div className="PhoneWrapper">
          <div className="PhoneLayout">
            {products.map((product) => (
              <div className="PhoneCard" key={product.id || product.slug || product.name}>
                <h4>{product.name}</h4>
                <Link href={`/product/${product.slug}`} passHref>
                  <div className="PhoneImage" style={{ width: 150, height: 200, position: 'relative' }}>
                    <Image 
                      src={product.image || '/images/placeholder.png'}
                      alt={product.name} 
                      fill
                      sizes="(max-width: 768px) 100vw, 150px"
                      style={{ 
                        objectFit: 'contain',
                        width: '100%',
                        height: '100%'
                      }}
                      onError={(e) => {
                        // TypeScript requires casting the event target
                        const img = e.target as HTMLImageElement;
                        img.src = '/images/placeholder.png';
                      }}
                    />
                  </div>
                </Link>
                <div className="PhonePrice">
                  <h4>on sale for ${product.price || product.salePrice || '0.00'}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
