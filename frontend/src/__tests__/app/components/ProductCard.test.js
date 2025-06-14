import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// This is an example test for a hypothetical ProductCard component
// You'll need to adjust this based on your actual component structure

// Mock component - replace with import to your actual component when it exists
const ProductCard = ({ product, onAddToCart }) => (
  <div data-testid="product-card">
    <h3>{product.name}</h3>
    <p>${product.price}</p>
    <button onClick={() => onAddToCart(product)}>Add to Cart</button>
  </div>
);

describe('ProductCard Component', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Phone',
    price: 999.99,
    image: '/test-image.jpg',
  };
  
  const mockAddToCart = jest.fn();

  beforeEach(() => {
    mockAddToCart.mockClear();
  });

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />);
    
    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    expect(screen.getByText(`$${mockProduct.price}`)).toBeInTheDocument();
  });

  it('calls onAddToCart when Add to Cart button is clicked', async () => {
    render(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />);
    
    const button = screen.getByRole('button', { name: /add to cart/i });
    await userEvent.click(button);
    
    expect(mockAddToCart).toHaveBeenCalledTimes(1);
    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct);
  });
});
