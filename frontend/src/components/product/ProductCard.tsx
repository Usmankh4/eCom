'use client';

import React from 'react';
import Link from 'next/link';
import { ProductCardProps } from '@/types/product';
import { formatPrice, formatDiscount } from '../../utils/formatters';
import ProductImage from './ProductImage';
import styles from './ProductCard.module.css';

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  showAddToCart = false, // Default to false to remove add to cart button
  className = ''
}) => {

  const {
    id,
    name,
    slug,
    price,
    originalPrice,
    salePrice,
    discount,
    image,
    isNew,
    isBestSeller,
    rating,
    inStock = true
  } = product;

  const displayPrice = salePrice || price;
  const hasDiscount = originalPrice && displayPrice < originalPrice;
  
  // Add sale class if product is on discount
  const cardClasses = [
    styles.productCard,
    'carousel-product-card',
    hasDiscount ? 'sale' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      <Link 
        href={`/product/${slug}`} 
        className={styles.cardLink}
      >
        <div className={styles.cardImage}>
          <ProductImage 
            src={image}
            alt={name}
            width={200}
            height={200}
            quality={80}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={isBestSeller || isNew}
            className={styles.productCardImage}
          />
          
          {/* Show badges if enabled */}
          <div className={styles.cardBadges}>
            {isNew && (
              <span className={`${styles.badge} ${styles.newBadge}`}>NEW</span>
            )}
            {isBestSeller && !isNew && (
              <span className={`${styles.badge} ${styles.bestSellerBadge}`}>BEST SELLER</span>
            )}
            {hasDiscount && (
              <div className={styles.discountBadge}>
                {discount || formatDiscount(originalPrice, displayPrice)}
              </div>
            )}
          </div>
          
          {/* Out of stock overlay */}
          {!inStock && (
            <div className={styles.outOfStockOverlay}>
              Out of Stock
            </div>
          )}
        </div>
        
        <div className={styles.cardContent}>
          <h3 className={styles.cardTitle}>
            {name}
          </h3>
          
          <div className={styles.cardPrice}>
            {hasDiscount ? (
              <>
                <span className={styles.salePrice}>
                  {formatPrice(displayPrice)}
                </span>
                <span className={styles.originalPrice}>
                  {formatPrice(originalPrice)}
                </span>
                <span className={styles.saleTag}>Sale</span>
              </>
            ) : (
              <span>{formatPrice(displayPrice)}</span>
            )}
          </div>

          {rating && (
            <div className={styles.productRating}>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`star ${i < Math.floor(rating) ? 'filled' : ''}`}>★</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
