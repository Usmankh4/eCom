import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCard from '../../src/app/components/ProductCard';

// Mock Next.js image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    return <img {...props} alt={props.alt || ''} />;
  },
}));

describe('ProductCard Component', () => {
  const mockProduct = {
    id: '1',
    name: 'iPhone 15',
    price: 999.99,
    image: '/images/iphone15.jpg',
    inStock: true,
  };
  
  const outOfStockProduct = {
    id: '2',
    name: 'Samsung Galaxy S23',
    price: 899.99,
    image: '/images/galaxy-s23.jpg',
    inStock: false,
  };
  
  const newArrivalProduct = {
    id: '3',
    name: 'Google Pixel 8',
    price: 799.99,
    image: '/images/pixel8.jpg',
    inStock: true,
    isNewArrival: true,
  };
  
  const bestSellerProduct = {
    id: '4',
    name: 'AirPods Pro',
    price: 249.99,
    image: '/images/airpods-pro.jpg',
    inStock: true,
    isBestSeller: true,
  };
  
  const mockAddToCart = jest.fn();

  beforeEach(() => {
    mockAddToCart.mockClear();
  });

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />);
    
    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    expect(screen.getByText(`$${mockProduct.price.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
    
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockProduct.image);
    expect(image).toHaveAttribute('alt', mockProduct.name);
  });

  it('calls onAddToCart when Add to Cart button is clicked', async () => {
    const user = userEvent.setup();
    render(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />);
    
    const button = screen.getByRole('button', { name: /add to cart/i });
    await user.click(button);
    
    expect(mockAddToCart).toHaveBeenCalledTimes(1);
    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it('shows out of stock message when product is not in stock', () => {
    render(<ProductCard product={outOfStockProduct} onAddToCart={mockAddToCart} />);
    
    expect(screen.getByText(outOfStockProduct.name)).toBeInTheDocument();
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add to cart/i })).not.toBeInTheDocument();
  });

  it('displays New badge for new arrival products', () => {
    render(<ProductCard product={newArrivalProduct} onAddToCart={mockAddToCart} />);
    
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('displays Best Seller badge for best seller products', () => {
    render(<ProductCard product={bestSellerProduct} onAddToCart={mockAddToCart} />);
    
    expect(screen.getByText('Best Seller')).toBeInTheDocument();
  });

  it('renders placeholder when no image is provided', () => {
    const productWithoutImage = { ...mockProduct, image: null };
    render(<ProductCard product={productWithoutImage} onAddToCart={mockAddToCart} />);
    
    expect(screen.getByText('No Image')).toBeInTheDocument();
  });

  it('does not render when product is null', () => {
    const { container } = render(<ProductCard product={null} onAddToCart={mockAddToCart} />);
    expect(container.firstChild).toBeNull();
  });
});
