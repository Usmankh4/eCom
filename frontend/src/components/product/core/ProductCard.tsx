'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { formatPrice } from '@/utils/formatters';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import styles from '../styles/ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  showAddToCart = false,
  className = ''
}) => {
  // Hooks for cart and wishlist functionality
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  // Extract product properties with safe defaults
  const {
    id,
    name,
    slug,
    price = 0,
    compareAtPrice,
    images = [],
    isNew = false,
    isBestSeller = false,
    rating = 0,
    inStock = true,
    brand = ''
  } = product;

  // Calculate discount if compareAtPrice exists
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercentage = hasDiscount 
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) 
    : 0;
  
  // Get primary image or fallback
  const getImageUrl = () => {
    try {
      // First check if there's a direct image property
      if (product.image) {
        return product.image.startsWith('http') || product.image.startsWith('/')
          ? product.image
          : `/${product.image}`;
      }
      
      // Then check the images array
      if (!images || !images.length) return '/placeholder.jpg';
      
      const firstImage = images[0];
      if (!firstImage) return '/placeholder.jpg';
      
      // Handle string URL
      if (typeof firstImage === 'string') {
        return firstImage.startsWith('http') || firstImage.startsWith('/')
          ? firstImage
          : `/${firstImage}`;
      }
      
      // Handle ProductImage object
      if (firstImage && typeof firstImage === 'object' && 'url' in firstImage) {
        const url = firstImage.url;
        if (!url) return '/placeholder.jpg';
        return url.startsWith('http') || url.startsWith('/')
          ? url
          : `/${url}`;
      }
      
      return '/placeholder.jpg';
    } catch (error) {
      console.error('Error getting image URL for product', product.id, ':', error);
      return '/placeholder.jpg';
    }
  };
  
  const imageUrl = getImageUrl();
  
  // Ensure we have a valid slug for navigation
  const productSlug = slug || String(id);
  
  // Handle add to cart
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      productId: id,
      name,
      price,
      image: imageUrl,
      quantity: 1,
      brand
    });
  };
  
  // Handle wishlist toggle
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(id)) {
      removeFromWishlist(id);
    } else {
      addToWishlist({
        productId: id,
        name,
        price,
        image: imageUrl
      });
    }
  };
  
  // Generate product URL - ensure it's always a valid URL
  // Using singular form (/product/) as per the unified product route structure
  const productUrl = `/product/${productSlug}`;
  
  // Combine classes
  const cardClasses = [
    styles.productCard,
    className,
    hasDiscount ? styles.sale : '',
    !inStock ? styles.outOfStock : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      <Link 
        href={productUrl} 
        className={styles.cardLink}
        prefetch={true}
      >
        <div className={styles.cardImage}>
          <div className={styles.cardImage}>
            <Image 
              src={imageUrl}
              alt={name}
              width={280}
              height={280}
              quality={80}
              sizes="(max-width: 480px) 120px, (max-width: 768px) 140px, (max-width: 1024px) 160px, 180px"
              priority={isBestSeller || isNew}
              className={styles.productCardImage}
              style={{ objectFit: 'contain' }}
            />
          </div>
          
          {/* Badges */}
          <div className={styles.cardBadges}>
            {isNew && (
              <span className={`${styles.badge} ${styles.newBadge}`}>NEW</span>
            )}
            {isBestSeller && !isNew && (
              <span className={`${styles.badge} ${styles.bestSellerBadge}`}>BEST SELLER</span>
            )}
            {hasDiscount && (
              <div className={styles.discountBadge}>
                -{discountPercentage}%
              </div>
            )}
          </div>
          
          {/* Out of stock overlay */}
          {!inStock && (
            <div className={styles.outOfStockOverlay}>
              <span>Out of Stock</span>
            </div>
          )}
        </div>
        
        <div className={styles.cardContent}>
          <h3 className={styles.cardTitle}>{name}</h3>
          
          {brand && (
            <p className={styles.cardBrand}>{brand}</p>
          )}
          
          <div className={styles.cardPrice}>
            {hasDiscount ? (
              <>
                <span className={styles.salePrice}>
                  {formatPrice(price)}
                </span>
                <span className={styles.originalPrice}>
                  {formatPrice(compareAtPrice)}
                </span>
              </>
            ) : (
              <span>{formatPrice(price)}</span>
            )}
          </div>
        </div>
      </Link>
      
      {/* Action buttons */}
      <div className={styles.cardActions}>
        {showAddToCart && inStock && (
          <button 
            onClick={handleAddToCart}
            className={styles.actionButton}
            aria-label="Add to cart"
          >
            <ShoppingCartIcon className="w-5 h-5" />
          </button>
        )}
        
        <button 
          onClick={handleWishlistToggle}
          className={`${styles.actionButton} ${isInWishlist(id) ? styles.active : ''}`}
          aria-label={isInWishlist(id) ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isInWishlist(id) ? (
            <HeartSolid className="w-5 h-5 text-red-500" />
          ) : (
            <HeartIcon className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
