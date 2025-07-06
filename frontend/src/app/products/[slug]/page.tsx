import { Suspense } from 'react';
import { HydrationBoundary } from '@tanstack/react-query';
import { prefetchQuery } from '@/utils/queryHydration';
import { getProductBySlug, getRelatedProducts } from '@/utils/api/serverProductService';
import { ProductDetails, RelatedProducts, ProductSkeleton } from '@/components/product';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Product, ProductImage } from '@/types/product';

// Generate metadata for the page
export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  try {
    // Await the params before using them
    const slug = (await params).slug;
    const product = await getProductBySlug(slug);

    const imageUrl = typeof product.images?.[0] === 'string' 
      ? product.images[0] 
      : (product.images?.[0] as ProductImage)?.url || '/placeholder.jpg';

    return {
      title: `${product.name} | eCommerce Store`,
      description: product.description || 'Product details',
      openGraph: {
        title: product.name,
        description: product.description || 'Product details',
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 600,
            alt: product.name,
          },
        ],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    };
  }
}

// Simple in-memory cache for product data
const productCache = new Map<string, any>();

// Prefetch product data on the server
async function prefetchProductData(slug: string) {
  // Check cache first
  if (productCache.has(slug)) {
    return productCache.get(slug);
  }

  try {
    const product = await getProductBySlug(slug);
    if (!product) {
      notFound();
    }
    
    // Prefetch related products in the background (non-blocking)
    const relatedPromise = getRelatedProducts(product.id).catch(() => []);
    
    // Create a simple query key
    const queryKey = ['product', slug];
    
    // Prepare the result object
    const result = {
      product,
      dehydratedState: await prefetchQuery(
        queryKey,
        () => Promise.resolve(product)
      ),
      relatedProducts: await relatedPromise
    };

    // Cache the result for future requests
    productCache.set(slug, result);
    return result;
  } catch (error) {
    console.error('Error prefetching product data:', error);
    notFound();
  }
}

interface ProductPageProps {
  params: { slug: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    // Get slug from params directly - no need to await params
    const { slug } = params;
    if (!slug) {
      notFound();
    }

    const { dehydratedState } = await prefetchProductData(slug);
    
    return (
      <main className="container mx-auto px-4 py-8">
        <HydrationBoundary state={dehydratedState}>
          <Suspense fallback={<ProductSkeleton />}>
            <ProductDetails slug={slug} />
          </Suspense>
          
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <Suspense fallback={<div>Loading related products...</div>}>
              <RelatedProducts productSlug={slug} />
            </Suspense>
          </div>
        </HydrationBoundary>
      </main>
    );
  } catch (error) {
    console.error('Error in ProductPage:', error);
    notFound();
  }
}
