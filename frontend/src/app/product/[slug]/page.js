import { notFound } from 'next/navigation';
import ProductDetail from '@/components/product/ProductDetail';
import { getProductBySlug } from '@/utils/api/productApi';

export async function generateMetadata({ params }) {
  // Destructure after awaiting params
  const { slug } = await Promise.resolve(params);
  
  try {
    const product = await getProductBySlug(slug);
    
    if (!product) {
      // Product not found - handled by notFound()
      return { title: 'Product Not Found' };
    }
    
    return {
      title: `${product.name} - Mobile Shop`,
      description: product.description?.substring(0, 160) || `Buy ${product.name} at the best price`,
      openGraph: {
        images: [{ url: product.image || product.images?.[0]?.url || '/images/placeholder.png' }],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error.message || 'Unknown error');
    return { title: 'Error Loading Product' };
  }
}

export default async function ProductPage({ params }) {
  // Destructure after awaiting params
  const { slug } = await Promise.resolve(params);
  
  try {
    // Fetching product data
    const product = await getProductBySlug(slug);
    
    if (!product) {
      // Product not found - handled by notFound()
      return notFound();
    }
    
    // Product data loaded successfully
    return <ProductDetail product={product} />;
  } catch (error) {
    console.error('Error loading product page:', error.message || 'Unknown error');
    return notFound();
  }
}
