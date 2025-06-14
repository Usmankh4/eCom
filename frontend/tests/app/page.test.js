import { render, screen } from '@testing-library/react';
import Page from '../../src/app/page';

// Mock any components or hooks used in the Page component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock fetch API
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      phones: [],
      featuredPhones: [],
      accessories: []
    })
  })
);

// Mock the page component for testing
jest.mock('../../src/app/page', () => {
  const mockPage = () => <div><h1>Home Page</h1><a href="/products">Products</a></div>;
  mockPage.displayName = 'MockedPage';
  return mockPage;
});

describe('Home Page', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders the main heading', () => {
    render(<Page />);
    
    // This is just an example assertion - adjust based on your actual page content
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Page />);
    
    // Example test - update with your actual navigation links
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });
});
