import { fetchProducts, fetchProductById } from '@/app/api/productApi';

// Mock fetch globally
global.fetch = jest.fn();

describe('Product API', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('fetches products successfully', async () => {
    const mockProducts = [
      { id: '1', name: 'iPhone 15', price: 999 },
      { id: '2', name: 'Samsung Galaxy S23', price: 899 }
    ];
    
    // Mock the fetch response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    // Call the API function
    const result = await fetchProducts();
    
    // Verify fetch was called with correct URL
    expect(fetch).toHaveBeenCalledWith('/api/products');
    
    // Verify the result matches our mock data
    expect(result).toEqual(mockProducts);
  });

  it('handles fetch error for products', async () => {
    // Mock a failed fetch
    fetch.mockRejectedValueOnce(new Error('Network error'));

    // Call the API function and expect it to throw
    await expect(fetchProducts()).rejects.toThrow('Network error');
  });

  it('fetches a single product by ID', async () => {
    const mockProduct = { id: '1', name: 'iPhone 15', price: 999 };
    
    // Mock the fetch response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct,
    });

    // Call the API function
    const result = await fetchProductById('1');
    
    // Verify fetch was called with correct URL
    expect(fetch).toHaveBeenCalledWith('/api/products/1');
    
    // Verify the result matches our mock data
    expect(result).toEqual(mockProduct);
  });
});
