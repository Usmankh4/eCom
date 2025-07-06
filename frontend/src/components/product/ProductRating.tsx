'use client';

import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

interface ProductRatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
}

export default function ProductRating({
  rating,
  reviewCount = 0,
  size = 'medium',
  showCount = true
}: ProductRatingProps) {
  // Calculate full and partial stars
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  // Determine star size
  const starSize = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  }[size];
  
  // Determine text size
  const textSize = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  }[size];
  
  return (
    <div className="flex items-center">
      <div className="flex items-center">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <StarSolid key={`full-${i}`} className={`${starSize} text-yellow-400`} aria-hidden="true" />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <StarOutline className={`${starSize} text-yellow-400`} aria-hidden="true" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <StarSolid className={`${starSize} text-yellow-400`} aria-hidden="true" />
            </div>
          </div>
        )}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <StarOutline key={`empty-${i}`} className={`${starSize} text-yellow-400`} aria-hidden="true" />
        ))}
      </div>
      
      {/* Review count */}
      {showCount && (
        <p className={`ml-2 ${textSize} text-gray-500`}>
          {reviewCount > 0 ? `(${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'})` : 'No reviews yet'}
        </p>
      )}
    </div>
  );
}
