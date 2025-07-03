/**
 * Utility functions for formatting data in the application
 */

/**
 * Format a price value to a currency string
 * @param price - The price to format
 * @param currency - The currency symbol to use (default: $)
 * @returns Formatted price string
 */
export const formatPrice = (price: number | undefined | null, currency: string = '$'): string => {
  if (price === undefined || price === null) {
    return `${currency}0.00`;
  }
  return `${currency}${parseFloat(price.toString()).toFixed(2)}`;
};

/**
 * Format a discount percentage
 * @param originalPrice - The original price
 * @param currentPrice - The current/sale price
 * @returns Formatted discount percentage string
 */
export const formatDiscount = (originalPrice: number, currentPrice: number): string => {
  if (!originalPrice || !currentPrice || originalPrice <= currentPrice) {
    return '';
  }
  
  const discountPercent = Math.round((1 - currentPrice / originalPrice) * 100);
  return `${discountPercent}% OFF`;
};
