'use client';

import React, { Suspense, ReactNode } from 'react';
import ErrorBoundary from '../../ui/ErrorBoundary';
import LoadingSpinner from '../../ui/LoadingSpinner';
// Using relative path to the newly moved component
import ProductCardSkeleton from '../loading/ProductCardSkeleton';

interface ProductWrapperProps {
  children: ReactNode;
  isLoading?: boolean;
  fallback?: ReactNode;
}

// This component wraps product components with error handling and loading states
const ProductWrapper: React.FC<ProductWrapperProps> = ({ children, isLoading, fallback }) => {
  // Use custom fallback if provided, otherwise use default loading spinner
  const loadingFallback = fallback || <ProductCardSkeleton />;
  
  return (
    <ErrorBoundary>
      <Suspense fallback={loadingFallback}>
        {isLoading ? loadingFallback : children}
      </Suspense>
    </ErrorBoundary>
  );
};

export default ProductWrapper;
