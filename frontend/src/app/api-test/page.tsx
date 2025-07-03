'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ApiResponse {
  [key: string]: any;
}

export default function ApiTestPage() {
  const [apiUrl, setApiUrl] = useState<string>('');
  const [slug, setSlug] = useState<string>('samsung-samsung-galaxy-s23-ultra');
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get the API URL from environment variable
    const url = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    setApiUrl(url);
  }, []);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const url = `${apiUrl}/api/products/${slug}`;
      // Testing API endpoint
      
      const response = await fetch(url, { cache: 'no-store' });
      // Received response
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('API Test Error:', err instanceof Error ? err.message : 'Unknown error');
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      <div className="mb-4">
        <label className="block mb-2">API URL:</label>
        <input 
          type="text" 
          value={apiUrl} 
          onChange={(e) => setApiUrl(e.target.value)}
          className="border p-2 w-full"
        />
      </div>
      
      <div className="mb-4">
        <label className="block mb-2">Product Slug:</label>
        <input 
          type="text" 
          value={slug} 
          onChange={(e) => setSlug(e.target.value)}
          className="border p-2 w-full"
        />
      </div>
      
      <button 
        onClick={testApi}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test API'}
      </button>
      
      {loading && (
        <div className="mt-4">
          <LoadingSpinner size="md" text="Fetching data..." />
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h2 className="font-bold">Error:</h2>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-4">
          <h2 className="font-bold text-xl mb-2">API Response:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
