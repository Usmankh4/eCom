'use client';

import { useState, useEffect } from 'react';
import { Product, ProductImage as ProductImageType, PhoneVariant, Phone, Accessory } from '@/types/product';
import { ProductGallery } from '../ui';
import { ProductVariantSelector } from '../variants';
import { ProductActions } from '../interactions';
import { ProductInfo } from '../ui';
import ProductWrapper from './ProductWrapper';
import '../styles/ProductDetail.css';

interface ProductDetailProps {
  product: Product;
  relatedProducts?: Product[];
}

/**
 * Main product detail component that coordinates all product subcomponents
 */
const ProductDetail: React.FC<ProductDetailProps> = ({ product, relatedProducts = [] }) => {
  const [selectedVariant, setSelectedVariant] = useState<PhoneVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [productImages, setProductImages] = useState<ProductImageType[]>([]);
  
  // Type guard to check if product is a Phone with variants
  const isPhoneWithVariants = (product: Product): product is Phone => 
    'type' in product && product.type === 'phone' && 
    'variants' in product && 
    Array.isArray(product.variants) && 
    product.variants.length > 0;

  // Determine if product has variants (like phones with different colors/storage)
  const hasVariants = isPhoneWithVariants(product);
  const phoneVariants = hasVariants ? (product as Phone).variants || [] : [];
  
  // Group variants by attributes (e.g., color, storage)
  const colorOptions = hasVariants
    ? Array.from(new Set(
        phoneVariants
          .filter((variant): variant is PhoneVariant & { color: string } => Boolean(variant?.color))
          .map(variant => variant.color)
      ))
    : ('colors' in product ? product.colors?.map(color => color.name) : []) || [];
    
  const storageOptions = hasVariants
    ? Array.from(new Set(
        phoneVariants
          .filter((variant): variant is PhoneVariant & { storage: string } => Boolean(variant?.storage))
          .map(variant => variant.storage)
      ))
    : ('storage_options' in product ? product.storage_options?.map(option => option.storage_amount) : []) || [];
  
  // Set initial selected variant and images
  useEffect(() => {
    // Initialize images array
    let initialImages: ProductImageType[] = [];
    
    // First check if we have the new images array format
    if (product.images && product.images.length > 0) {
      // Ensure images are in the correct format
      initialImages = product.images.map(img => 
        typeof img === 'string' 
          ? { url: img, alt: product.name }
          : img
      ) as ProductImageType[];
      
      // If we also have variants, set the selected variant
      if (hasVariants && phoneVariants.length > 0) {
        setSelectedVariant(phoneVariants[0]);
      }
    } 
    // Fallback to variants if available
    else if (hasVariants && phoneVariants.length > 0) {
      const firstVariant = phoneVariants[0];
      if (firstVariant) {
        setSelectedVariant(firstVariant);
      }
      
      // Create images from variants
      initialImages = phoneVariants
        .filter((variant): variant is PhoneVariant & { image: string } => 
          Boolean(variant?.image)
        )
        .map(variant => ({
          url: variant.image,
          alt: `${product.name}${variant.color ? ` - ${variant.color}` : ''}${variant.storage ? ` ${variant.storage}` : ''}`,
          ...(variant.color && { color: variant.color }),
          ...(variant.storage && { storage: variant.storage }),
          variantId: variant.id
        }));
    } 
    // Handle old product structure with colors and color_images
    else if (product.colors && product.colors.length > 0) {
      const defaultColor = product.colors[0];
      
      // Create images from color_images
      if (product.color_images && product.color_images.length > 0) {
        initialImages = product.color_images.map(colorImage => ({
          url: colorImage.image || '',
          alt: `${product.name} - ${colorImage.color_name}`,
          color: colorImage.color_name
        }));
      }
      
      // Set default storage if available
      if (product.storage_options && product.storage_options.length > 0) {
        const defaultStorage = product.storage_options[0];
        setSelectedVariant({
          id: `${defaultColor.name}-${defaultStorage.storage_amount}`,
          color: defaultColor.name,
          storage: defaultStorage.storage_amount,
          price: parseFloat(defaultStorage.price.toString()),
          inStock: true
        });
      }
    } 
    // Fallback to single image
    else if (product.image) {
      initialImages = [{
        url: product.image,
        alt: product.name,
        isPrimary: true
      }];
    }
    
    setProductImages(initialImages);
  }, [product, hasVariants]);
  
  // Handle variant selection
  const handleColorSelect = (color: string) => {
    if (hasVariants) {
      const newVariant = phoneVariants.find((v): v is PhoneVariant & { color: string; storage?: string } => 
        v.color === color && 
        (selectedVariant ? v.storage === selectedVariant.storage : true)
      );
      
      if (newVariant) {
        setSelectedVariant(newVariant);
      }
    } else if ('colors' in product) {
      // For old product structure
      setSelectedVariant(prev => prev ? {
        ...prev,
        color: color
      } : null);
    }
  };
  
  const handleStorageSelect = (storage: string) => {
    if (hasVariants) {
      const newVariant = phoneVariants.find((v): v is PhoneVariant & { color?: string; storage: string } => 
        (selectedVariant ? v.color === selectedVariant.color : true) && 
        v.storage === storage
      );
      
      if (newVariant) {
        setSelectedVariant(newVariant);
      }
    } else if ('storage_options' in product) {
      // For old product structure
      const storageOption = product.storage_options?.find(option => option.storage_amount === storage);
      if (storageOption) {
        setSelectedVariant(prev => prev ? {
          ...prev,
          storage: storage,
          price: parseFloat(storageOption.price.toString())
        } : null);
      }
    }
  };
  
  // Calculate current price
  const currentPrice = selectedVariant?.price || product.price;
  
  if (!product) return null;
  
  return (
    <ProductWrapper>
      <div className="ProductLayout">
        <div className="ProductContainer">
          {/* Product Gallery */}
          <ProductGallery
            images={productImages}
            fallbackImage={product.image || '/images/placeholder.png'}
            productName={product.name}
            className="ProductImage"
          />
          
          <div className="ProductInfo">
            {/* Product Information */}
            <ProductInfo 
              product={product} 
              currentPrice={currentPrice} 
            />
            
            <div className="SelectionsContainer">
              {/* Variant Selector - Only show if we have a phone with variants or color/storage options */}
              {((hasVariants && colorOptions.length > 0) || 
                (!hasVariants && (colorOptions.length > 0 || storageOptions.length > 0))) && (
                <ProductVariantSelector
                  colorOptions={colorOptions}
                  storageOptions={storageOptions}
                  selectedVariant={selectedVariant}
                  onColorSelect={handleColorSelect}
                  onStorageSelect={handleStorageSelect}
                />
              )}
              
              {/* Product Actions */}
              <ProductActions
                product={product}
                selectedVariant={selectedVariant}
                quantity={quantity}
                setQuantity={setQuantity}
                className="product-actions"
              />
            </div>
          </div>
        </div>
      </div>
    </ProductWrapper>
  );
};

export default ProductDetail;
