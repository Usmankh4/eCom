'use client';

import React from 'react';
import { PhoneVariant } from '@/types/product';

interface ProductVariantSelectorProps {
  colorOptions: string[];
  storageOptions: string[];
  selectedVariant: PhoneVariant | null;
  onColorSelect: (color: string) => void;
  onStorageSelect: (storage: string) => void;
}

/**
 * Component for selecting product variants (color, storage)
 */
const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  colorOptions,
  storageOptions,
  selectedVariant,
  onColorSelect,
  onStorageSelect
}) => {
  return (
    <div className="variant-selector">
      {colorOptions.length > 0 && (
        <div className="color-selection">
          <label htmlFor="color-select">Color</label>
          <select
            id="color-select"
            value={selectedVariant?.color || ''}
            onChange={(e) => onColorSelect(e.target.value)}
            className="select-input"
          >
            {colorOptions.map((color) => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
        </div>
      )}
      
      {storageOptions.length > 0 && (
        <div className="storage-selection">
          <label htmlFor="storage-select">Storage</label>
          <select
            id="storage-select"
            value={selectedVariant?.storage || ''}
            onChange={(e) => onStorageSelect(e.target.value)}
            className="select-input"
          >
            {storageOptions.map((storage) => (
              <option key={storage} value={storage}>{storage} GB</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default ProductVariantSelector;
