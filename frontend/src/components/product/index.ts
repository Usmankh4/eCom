// Re-export components from subdirectories
// Core components
export * from './core';

// UI components
export * from './ui';

// Interactive components
export * from './interactions';

// Variant selection components
export * from './variants';

// Loading state components
export * from './loading';

// Related products components
export * from './related';

// Legacy exports (to maintain backward compatibility)
export { default as ProductCard } from './core/ProductCard';
export { default as ProductDetails } from './core/ProductDetails';
export { default as ProductDetail } from './core/ProductDetail';
export { default as ProductQuantity } from './interactions/ProductQuantity';
export { default as ProductRating } from './ui/ProductRating';
export { default as ProductSkeleton } from './loading/ProductSkeleton';
export { default as ProductVariants } from './variants/ProductVariants';
export { default as RelatedProducts } from './related/RelatedProducts';
