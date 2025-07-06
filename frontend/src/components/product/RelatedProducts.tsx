'use client';

import { useEffect, useState } from 'react';
import { useProductBySlug, useRelatedProducts } from '@/hooks/useProducts';
import ProductCard from './ProductCard';
import ErrorMessage from '@/components/ui/ErrorMessage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Product, ProductImage } from '@/types/product';

interface RelatedProductsProps {
  productSlug: string;
}

// Helper to get the first image URL from product
const getFirstImageUrl = (images: Product['images']): string => {
  if (!images?.length) return '/placeholder.jpg';
  const firstImage = images[0];
  return typeof firstImage === 'string' ? firstImage : firstImage?.url || '/placeholder.jpg';
};

export default function RelatedProducts({ productSlug }: RelatedProductsProps) {
  const [hasError, setHasError] = useState(false);
  
  // First get the product to access its ID
  const { 
    data: product,
    isLoading: isLoadingProduct,
    isError: isProductError,
    error: productError
  } = useProductBySlug(productSlug);
  
  // Then fetch related products using the product ID
  const {
    data: relatedProducts = [],
    isLoading: isLoadingRelated,
    isError: isRelatedError,
    error: relatedError,
    refetch
  } = useRelatedProducts(product?.id, {
    enabled: !!product?.id && !hasError,
    // @ts-ignore - retry is a valid option for useQuery
    retry: 1,
  });
  
  const isLoading = isLoadingProduct || isLoadingRelated;
  const error = productError || relatedError;
  
  const handleRetry = () => {
    setHasError(false);
    if (refetch) {
      refetch();
    }
  };
  
  // Handle error state
  if ((isProductError || isRelatedError || hasError) && error) {
    return (
      <div className="py-4 text-center">
        <div className="text-red-600 mb-2">Unable to load related products</div>
        <button 
          onClick={handleRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  // If no related products but not in error state
  if (!relatedProducts?.length) {
    return (
      <div className="py-4 text-center">
        <p className="text-gray-500">No related products available at the moment.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">You May Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product: Product) => {
          const imageUrl = getFirstImageUrl(product.images);
          return (
            <ProductCard 
              key={product.id}
              product={{
                ...product,
                images: [imageUrl],
              }} 
            />
          );
        })}
      </div>
    </div>
  );
}
