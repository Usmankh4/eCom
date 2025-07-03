'use client';

import React from 'react';
import { LoadingSpinnerProps } from '@/types/ui';

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color,
  text = 'Loading...',
  fullScreen = false,
  className = '',
}) => {
  // Determine spinner size based on prop
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.md;
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base';
  
  // Determine container classes based on fullScreen prop
  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50' 
    : 'loading-spinner-container';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div 
        className={`loading-spinner ${spinnerSize}`}
        style={color ? { borderTopColor: color } : undefined}
      />
      {text && <p className={`mt-2 ${textSize}`}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
