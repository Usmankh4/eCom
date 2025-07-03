'use client';

import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';

// Import the component with dynamic import
const BrandProducts = dynamic(() => import('@/components/brand/BrandProducts'), { ssr: false });

export default function BrandPageClient({ brand, products }) {
  
  return (
    <div className="brand-page">
      <BrandProducts brand={brand} products={products || []} />
    </div>
  );
}
