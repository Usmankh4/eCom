'use client';

import React, { useState } from 'react';
import { ProductImage as ProductImageType } from '@/types/product';
import ProductImage from './ProductImage';

interface ProductGalleryProps {
  images: ProductImageType[];
  fallbackImage: string;
  productName: string;
  onImageSelect?: (image: ProductImageType) => void;
  className?: string;
}

/**
 * Component for displaying product images with thumbnails
 */
const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  fallbackImage,
  productName,
  onImageSelect,
  className = ''
}) => {
  const [selectedImage, setSelectedImage] = useState<ProductImageType | null>(
    images && images.length > 0 ? images[0] : null
  );
  
  // Handle thumbnail click
  const handleThumbnailClick = (image: ProductImageType) => {
    setSelectedImage(image);
    if (onImageSelect) {
      onImageSelect(image);
    }
  };
  
  // Get current image URL
  const currentImageUrl = selectedImage?.url || fallbackImage;
  
  return (
    <div className={`product-gallery ${className}`}>
      <div className="main-image-container">
        <ProductImage
          src={currentImageUrl}
          alt={productName}
          width={600}
          height={600}
          quality={100}
          priority
          className="main-product-image"
        />
      </div>
      
      {images && images.length > 1 && (
        <div className="product-thumbnails">
          {images.map((image, index) => (
            <div
              key={`${image.url}-${index}`}
              className={`thumbnail ${selectedImage?.url === image.url ? 'active' : ''}`}
              onClick={() => handleThumbnailClick(image)}
            >
              <ProductImage
                src={image.url}
                alt={`${productName} - ${image.alt || 'thumbnail'}`}
                width={100}
                height={100}
                quality={90}
                className="thumbnail-image"
              />
              {image.color && <span className="thumbnail-label">{image.color}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
