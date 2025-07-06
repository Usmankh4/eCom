'use client';

export default function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
      {/* Product Image Skeleton */}
      <div className="aspect-square rounded-lg bg-gray-200"></div>
      
      {/* Product Info Skeleton */}
      <div className="flex flex-col">
        {/* Title */}
        <div className="h-8 bg-gray-200 rounded-md w-3/4 mb-2"></div>
        
        {/* Brand */}
        <div className="h-4 bg-gray-200 rounded-md w-1/4 mt-1 mb-2"></div>
        
        {/* Rating */}
        <div className="h-4 bg-gray-200 rounded-md w-1/3 mt-2 mb-4"></div>
        
        {/* Price */}
        <div className="h-6 bg-gray-200 rounded-md w-1/4 mt-4 mb-4"></div>
        
        {/* Description */}
        <div className="space-y-2 mt-4">
          <div className="h-4 bg-gray-200 rounded-md w-full"></div>
          <div className="h-4 bg-gray-200 rounded-md w-full"></div>
          <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
        </div>
        
        {/* Variants */}
        <div className="mt-6">
          <div className="h-4 bg-gray-200 rounded-md w-1/6 mb-2"></div>
          <div className="flex gap-2 mt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-8 bg-gray-200 rounded-full"></div>
            ))}
          </div>
        </div>
        
        {/* Quantity */}
        <div className="mt-6">
          <div className="h-4 bg-gray-200 rounded-md w-1/6 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded-md w-32"></div>
        </div>
        
        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <div className="h-12 bg-gray-200 rounded-md flex-1"></div>
          <div className="h-12 bg-gray-200 rounded-md flex-1"></div>
        </div>
        
        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-4 bg-gray-200 rounded-md w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded-md w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
