/**
 * Type declarations for formatters utility
 */

export function formatPrice(price: number | undefined | null, currency?: string): string;
export function formatDiscount(originalPrice: number, currentPrice: number): string;
