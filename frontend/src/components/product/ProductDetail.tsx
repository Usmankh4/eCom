'use client';

import { useState, useEffect } from 'react';
import { Product, ProductImage as ProductImageType, PhoneVariant } from '@/types/product';
import ProductGallery from './ProductGallery';
import ProductVariantSelector from './ProductVariantSelector';
import ProductActions from './ProductActions';
import ProductInfo from './ProductInfo';
import ProductWrapper from './ProductWrapper';
import './ProductDetail.css';

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
  
  // Determine if product has variants (like phones with different colors/storage)
  const hasVariants = product.variants && product.variants.length > 0;
  
  // Group variants by attributes (e.g., color, storage)
  const colorOptions = hasVariants && product.variants 
    ? Array.from(new Set(product.variants.map((variant: PhoneVariant) => variant.color || '')))
    : product.colors?.map((color: {name: string}) => color.name) || [];
    
  const storageOptions = hasVariants && product.variants
    ? Array.from(new Set(product.variants.map((variant: PhoneVariant) => variant.storage || '')))
    : product.storage_options?.map((option: {storage_amount: string}) => option.storage_amount) || [];
  
  // Set initial selected variant and images
  useEffect(() => {
    // Initialize images array
    let initialImages: ProductImageType[] = [];
    
    // First check if we have the new images array format
    if (product.images && product.images.length > 0) {
      initialImages = product.images;
      
      // If we also have variants, set the selected variant
      if (hasVariants && product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0]);
      }
    } 
    // Fallback to old structure if images array is not available
    else if (hasVariants && product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
      
      // Create images from variants
      initialImages = product.variants.map(variant => ({
        url: variant.image || '',
        alt: `${product.name} - ${variant.color} ${variant.storage}`,
        color: variant.color,
        storage: variant.storage,
        variantId: variant.id
      }));
    } 
    // Handle old product structure
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
    if (hasVariants && product.variants) {
      const newVariant = product.variants.find(v => 
        v.color === color && 
        (selectedVariant ? v.storage === selectedVariant.storage : true)
      );
      
      if (newVariant) {
        setSelectedVariant(newVariant);
      }
    } else {
      // For old product structure
      setSelectedVariant(prev => prev ? {
        ...prev,
        color: color
      } : null);
    }
  };
  
  const handleStorageSelect = (storage: string) => {
    if (hasVariants && product.variants) {
      const newVariant = product.variants.find(v => 
        (selectedVariant ? v.color === selectedVariant.color : true) && 
        v.storage === storage
      );
      
      if (newVariant) {
        setSelectedVariant(newVariant);
      }
    } else {
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
              {/* Variant Selector */}
              {(colorOptions.length > 0 || storageOptions.length > 0) && (
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
