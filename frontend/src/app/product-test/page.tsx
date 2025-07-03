'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types/product';

export default function ProductTestPage() {
  // These are the actual slugs from your database
  const phoneSlugsList: string[] = [
    'apple-iphone-14', 
    'apple-iphone-15-pro-max', 
    'apple-iphone-16', 
    'samsung-samsung-galaxy-s23-ultra', 
    'samsung-samsung-a06'
  ];
  
  const [apiUrl, setApiUrl] = useState<string>(process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000');
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [apiResult, setApiResult] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const testApi = async (slug: string): Promise<void> => {
    setSelectedSlug(slug);
    setLoading(true);
    setError(null);
    setApiResult(null);
    
    try {
      const url = `${apiUrl}/products/${slug}`;
      // Testing product API endpoint
      
      const response = await fetch(url);
      // Received product response
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      setApiResult(data);
    } catch (err) {
      console.error('Product API Test Error:', err instanceof Error ? err.message : 'Unknown error');
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Product Test Page</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Product Slugs from Database</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {phoneSlugsList.map((slug) => (
            <div key={slug} className="border p-4 rounded">
              <p className="font-mono mb-2">{slug}</p>
              <div className="flex space-x-2">
                <button 
                  onClick={() => testApi(slug)}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                >
                  Test API
                </button>
                <Link 
                  href={`/product/${slug}`}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm inline-block"
                >
                  View Page
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {loading && <p className="text-gray-600">Testing API...</p>}
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h2 className="font-bold">Error for slug "{selectedSlug}":</h2>
          <p>{error}</p>
        </div>
      )}
      
      {apiResult && (
        <div className="mt-4">
          <h2 className="font-bold">API Response for slug "{selectedSlug}":</h2>
          <pre className="bg-gray-100 p-4 mt-2 overflow-auto max-h-96 rounded">
            {JSON.stringify(apiResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
