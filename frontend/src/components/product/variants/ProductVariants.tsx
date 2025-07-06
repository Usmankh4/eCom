'use client';

import { useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';

interface ProductVariantsProps {
  variants: Record<string, string[]>;
  selectedVariant: Record<string, string>;
  onVariantChange: (variant: Record<string, string>) => void;
}

export default function ProductVariants({
  variants,
  selectedVariant,
  onVariantChange
}: ProductVariantsProps) {
  // Get variant types (e.g., "color", "storage", etc.)
  const variantTypes = Object.keys(variants);
  
  // Handle variant selection
  const handleVariantSelect = (type: string, value: string) => {
    onVariantChange({
      ...selectedVariant,
      [type]: value
    });
  };
  
  // Render color variant options
  const renderColorOptions = (type: string, options: string[]) => {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map((color) => {
          const isSelected = selectedVariant[type] === color;
          // Convert color name to CSS color if possible
          const colorValue = color.toLowerCase().replace(/\s+/g, '');
          
          return (
            <button
              key={color}
              type="button"
              className={`color-option ${isSelected ? 'selected' : ''}`}
              style={{ backgroundColor: colorValue }}
              onClick={() => handleVariantSelect(type, color)}
              aria-label={`Color: ${color}`}
            >
              {isSelected && (
                <span className="color-check">
                  <CheckIcon className="h-4 w-4" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };
  
  // Render other variant options (storage, size, etc.)
  const renderDefaultOptions = (type: string, options: string[]) => {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map((option) => {
          const isSelected = selectedVariant[type] === option;
          
          return (
            <button
              key={option}
              type="button"
              className={`storage-option ${isSelected ? 'selected' : ''}`}
              onClick={() => handleVariantSelect(type, option)}
            >
              {option}
            </button>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className="variants-container">
      {variantTypes.map((type) => {
        const options = variants[type];
        const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
        
        return (
          <div key={type} className="variant-group">
            <h3 className="variant-label">{formattedType}</h3>
            
            {type.toLowerCase() === 'color' 
              ? renderColorOptions(type, options)
              : renderDefaultOptions(type, options)
            }
          </div>
        );
      })}
    </div>
  );
}
