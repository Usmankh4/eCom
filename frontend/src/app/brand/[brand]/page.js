import { notFound } from 'next/navigation';
import BrandProducts from '@/components/brand/BrandProducts';

export async function generateMetadata({ params }) {
  
  const { brand } = await Promise.resolve(params);
  const brandName = brand.charAt(0).toUpperCase() + brand.slice(1);
  
  return {
    title: `${brandName} Products | Zain Wireless`,
    description: `Browse our collection of ${brandName} products.`,
  };
}

export default async function BrandPage({ params }) {
  
  const { brand } = await Promise.resolve(params);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  
  try {
    const response = await fetch(`${apiUrl}/products/brand/${brand}`, {
      next: { revalidate: 60 },
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch products');
    const products = await response.json();
    
    // Add debug log to verify data before passing to component
    // Removed development console logs
    return <BrandProducts brand={brand} initialProducts={products} />;
  } catch (error) {
    console.error('Brand page error:', error.message || 'Unknown error occurred');
    return (
      <div className="error-container">
        <h1>Something went wrong</h1>
        <p>We couldn't load the products for {brand}. Please try again later.</p>
        <p>Error: {error.message}</p>
      </div>
    );
  }
}