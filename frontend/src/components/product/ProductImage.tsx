'use client';

import React from 'react';
import Image from 'next/image';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';

interface ProductImageProps {
  src: string | StaticImport;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  className?: string;
  sizes?: string;
  style?: React.CSSProperties;
}

/**
 * Reusable product image component with consistent handling of
 * image optimization, placeholders, and error states
 */
const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  width = 200,
  height = 200,
  priority = false,
  quality = 80,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  style = { objectFit: 'contain' },
}) => {
  // Default placeholder for blur effect
  const blurDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  
  // Default image if src is missing
  const imageSrc = src || '/images/placeholder.png';
  
  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      quality={quality}
      priority={priority}
      placeholder="blur"
      blurDataURL={blurDataURL}
      sizes={sizes}
      className={className}
      style={style}
      onError={(e) => {
        // TypeScript requires casting the event target
        const img = e.target as HTMLImageElement;
        img.src = '/images/placeholder.png';
      }}
    />
  );
};

export default ProductImage;
