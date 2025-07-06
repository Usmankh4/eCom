'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useProductBySlug } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { ProductImage } from '@/types/product';
import { ProductRating, ProductQuantity, ProductVariants } from '@/components/product';
import { ErrorMessage, LoadingSpinner } from '@/components/ui';

interface ProductDetailsProps {
  slug: string;
}

export default function ProductDetails({ slug }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Record<string, string>>({});
  
  // Fetch product data using React Query
  const { 
    data: product, 
    isLoading, 
    isError, 
    error 
  } = useProductBySlug(slug);
  
  // Cart and wishlist hooks
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  
  // Handle loading state
  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }
  
  // Handle error state with more details
  if (isError || !product) {
    const errorMessage = error?.message || 'Failed to load product';
    console.error('Error loading product:', { 
      slug, 
      error: errorMessage, 
      errorDetails: error 
    });
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900">Product Not Found</h2>
                <p className="mt-1 text-gray-600">We couldn't find the product you're looking for.</p>
              </div>
            </div>
            
            <div className="mt-6">
              <ErrorMessage 
                message={`Error: ${errorMessage}`}
                retry={() => window.location.reload()}
              />
              
              <div className="mt-6 border-t border-gray-200 pt-4">
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                >
                  <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Go Back
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </button>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Technical Details
                  </h3>
                  <div className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                    <pre className="whitespace-pre-wrap">
                      <code className="text-gray-700">
                        {JSON.stringify({
                          slug,
                          error: error?.message,
                          timestamp: new Date().toISOString()
                        }, null, 2)}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Get primary image URL with better error handling
  const getImageUrl = (img: string | ProductImage | undefined): string => {
    try {
      // Handle undefined or null
      if (!img) return '/placeholder.jpg';
      
      // Handle string URL
      if (typeof img === 'string') {
        if (!img.trim()) return '/placeholder.jpg';
        return img.startsWith('http') || img.startsWith('/') 
          ? img 
          : `/${img}`;
      }
      
      // Handle ProductImage object
      if (img && typeof img === 'object' && 'url' in img && img.url) {
        const url = img.url.trim();
        if (!url) return '/placeholder.jpg';
        return url.startsWith('http') || url.startsWith('/')
          ? url
          : `/${url}`;
      }
      
      // Fallback to direct image property if available
      if ('image' in product && product.image) {
        const imgUrl = product.image.trim();
        return imgUrl.startsWith('http') || imgUrl.startsWith('/')
          ? imgUrl
          : `/${imgUrl}`;
      }
      
      return '/placeholder.jpg';
    } catch (error) {
      console.error('Error processing image URL:', error);
      return '/placeholder.jpg';
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    try {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: getImageUrl(product.images?.[0]),
        quantity,
        ...selectedVariant
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Handle error (e.g., show toast notification)
    }
  };
  
  // Handle wishlist toggle
  const handleWishlistToggle = () => {
    try {
      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
      } else {
        addToWishlist({
          productId: product.id,
          name: product.name,
          price: product.price,
          image: getImageUrl(product.images?.[0]),
          slug: product.slug || String(product.id)
        });
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      // Handle error (e.g., show toast notification)
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Product Images */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={getImageUrl(product.images?.[0])}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
            onError={(e) => {
              // If the image fails to load, replace it with the placeholder
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.jpg';
            }}
          />
        </div>
        
        {/* Thumbnails */}
        {product.images && product.images.length > 1 && (
          <div className="grid grid-cols-4 gap-2 mt-2">
            {product.images.slice(0, 4).map((img, index) => (
              <div key={index} className="relative aspect-square rounded overflow-hidden border-2 border-transparent hover:border-blue-500 transition-colors">
                <Image
                  src={getImageUrl(img)}
                  alt={`${product.name} - ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 25vw, 12.5vw"
                  className="object-cover cursor-pointer"
                  onClick={() => {
                    // Handle thumbnail click to change main image
                    // This requires state management for the selected image
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.jpg';
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold">{product.name}</h1>
        
        {/* Brand */}
        {product.brand && (
          <p className="text-sm text-gray-500 mt-1">Brand: {product.brand}</p>
        )}
        
        {/* Rating */}
        <div className="mt-2">
          <ProductRating rating={product.rating || 0} reviewCount={product.reviewCount || 0} />
        </div>
        
        {/* Price */}
        <div className="mt-4 flex items-baseline">
          <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="ml-2 text-sm text-gray-500 line-through">
              ${product.compareAtPrice.toFixed(2)}
            </span>
          )}
        </div>
        
        {/* Description */}
        <div className="mt-4 text-gray-700">
          <p>{product.description}</p>
        </div>
        
        {/* Variants */}
        {product.productVariants && Object.keys(product.productVariants).length > 0 && (
          <div className="mt-6">
            <ProductVariants 
              variants={product.productVariants} 
              selectedVariant={selectedVariant}
              onVariantChange={setSelectedVariant}
            />
          </div>
        )}
        
        {/* Quantity */}
        <div className="mt-6">
          <ProductQuantity 
            quantity={quantity} 
            onQuantityChange={setQuantity} 
            max={product.inventory || 10}
          />
        </div>
        
        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
            disabled={!product.inStock}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
          
          <button
            onClick={handleWishlistToggle}
            className={`flex-1 py-3 px-6 rounded-md border transition-colors ${
              isInWishlist(product.id)
                ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
          </button>
        </div>
        
        {/* Additional Info */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">SKU</p>
              <p>{product.sku || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500">Availability</p>
              <p>{product.inStock ? 'In Stock' : 'Out of Stock'}</p>
            </div>
            {product.categories && product.categories.length > 0 && (
              <div>
                <p className="text-gray-500">Category</p>
                <p>{product.categories.join(', ')}</p>
              </div>
            )}
            {product.tags && product.tags.length > 0 && (
              <div>
                <p className="text-gray-500">Tags</p>
                <p>{product.tags.join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
