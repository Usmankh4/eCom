import Image from 'next/image';
import Link from 'next/link';
import { cache } from 'react';
import {mapProducts} from './utils/mapProducts'
import ProductCarousel from '@/components/ui/ProductCarousel';
import ProductCard from '@/components/product/ProductCard';
const bannerImage = "/images/phone.png";
const phoneImages = {
  apple: "/images/15promax.jpg",
  samsung: "/images/samsungultra.jpg",
  google: "/images/Pixel8.png",
  accessories: "/images/Pixel8.png",
  tablets: "/images/Pixel8.png"
};

export const metadata = {
  title: 'Mobile Repair & Accessories - Your Trusted Tech Partner',
  description: 'Professional phone repair services and premium mobile accessories. We specialize in iPhone, Samsung, and other device repairs.',
};



export default async function Home() {
  const [productData, flashSalesData] = await Promise.all([
    fetchHomePageData(),
    fetchFlashSales()
  ]);
  const phoneCards = [
    { id: 'apple', name: 'Apple', link: '/brand/Apple', image: phoneImages.apple },
    { id: 'samsung', name: 'Samsung', link: '/brand/Samsung', image: phoneImages.samsung },
    { id: 'android', name: 'Android', link: '/brand/Android', image: phoneImages.google },
  ];

  const categoryCards = [
    { id: 'accessories', name: 'Accessories', link: '/brand/Accessories', image: phoneImages.accessories },
    { id: 'tablets', name: 'Tablets', link: '/brand/Tablet', image: phoneImages.tablets },
  ];
  const promotions = [
    { 
      id: 'promo1', 
      title: 'Summer Sale', 
      subtitle: 'Get up to 30% off on selected phones', 
      link: '/promotions/summer-sale',
      buttonText: 'Shop Now' 
    },
    { 
      id: 'promo2', 
      title: 'New Arrivals', 
      subtitle: 'Check out the latest phone models', 
      link: '/new-arrivals',
      buttonText: 'Discover' 
    },
    { 
      id: 'promo3', 
      title: 'Accessories Deal', 
      subtitle: 'Buy any case & get a screen protector 50% off', 
      link: '/promotions/accessories-bundle',
      buttonText: 'View Deal' 
    }
  ];
  

  
  
  
  
  async function fetchHomePageData() {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/homepage/`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to fetch homepage data');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to load homepage data:', error.message || 'Unknown error');
      return {
        flash_deals: { phones: [], accessories: [] },
        new_arrivals: { phones: [], accessories: [] },
        best_sellers: { phones: [], accessories: [] }
      };
    }
  }

  async function fetchFlashSales() {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/promotions/active-flash-deals/', {cache: 'no-store'});
      if (!response.ok) {
        throw new Error('Failed to fetch flash deals data');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to load flash deals:', error.message || 'Unknown error');
      return [];
    }
  }

  const bestSellers = mapProducts([
    ...(productData.best_sellers?.phones || []),
    ...(productData.best_sellers?.accessories || [])
  ]);

  const newArrivals = mapProducts([
    ...(productData.new_arrivals?.phones || []),
    ...(productData.new_arrivals?.accessories || [])
  ]);

  
  const hasNewArrivals = newArrivals.length > 0;
  const hasBestSellers = bestSellers.length > 0;
  const hasFlashDeals = (flashSalesData || []).length > 0;

  
  const newArrivalProducts = newArrivals.slice(0, 8);
  const bestSellerProducts = bestSellers.slice(0, 8);

  const flashDeals = (flashSalesData || []).map(product => ({
    id: product.id,
    name: product.name,
    originalPrice: parseFloat(product.original_price),
    salePrice: parseFloat(product.sale_price),
    price: parseFloat(product.sale_price),
    discount: product.discount_percentage ? `${parseFloat(product.discount_percentage).toFixed(0)}%` : 'Sale',
    image: product.image || '/images/placeholder.png',
    slug: product.slug,
    timeLeft: getTimeFromSeconds(product.time_remaining)
  }));
  
  return (
    <div className="page-container">
      <main className="main-content">
      <section className="hero-section">
  <div className="hero-content">
    <div className="hero-text">
      <h1 className="hero-title">Premium Phones & Expert Repairs</h1>
      <p className="hero-subtitle">Shop the latest smartphones or get your device fixed by certified technicians</p>
      <div className="hero-buttons">
        <Link href="/products/phones" className="btn btn-primary">Shop Phones</Link>
        <Link href="/repair" className="btn btn-outline">Book Repair</Link>
      </div>
    </div>
    <div className="hero-image">
      <Image 
        src={bannerImage} 
        alt="Latest Smartphones" 
        priority
        width={500}
        height={670}
        className="floating"
      />
    </div>
  </div>
</section>
        
        <section className="promotions-banner">
          <div className="promo-slider">
            {promotions.map((promo, index) => (
              <div key={promo.id} className={`promo-slide ${index === 0 ? 'active' : ''}`}>
                <div className="promo-content">
                  <h2 className="promo-title">{promo.title}</h2>
                  <p className="promo-subtitle">{promo.subtitle}</p>
                  <Link href={promo.link}>
                    <button className="btn btn-primary">{promo.buttonText}</button>
                  </Link>
                </div>
              </div>
            ))}
            <div className="promo-indicators">
              {promotions.map((_, index) => (
                <span key={index} className={`indicator ${index === 0 ? 'active' : ''}`}></span>
              ))}
            </div>
          </div>
        </section>
        
        
        {hasFlashDeals && (
          <section className="flash-deals-section">
            <ProductCarousel 
              title="Flash Deals" 
              viewAllLink="/flash-deals"
              itemsToShow={Math.min(4, flashDeals.length)}
              autoPlay={flashDeals.length > 1}
              autoPlayInterval={6000}
            >
              {flashDeals.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  className="carousel-card"
                />
              ))}
            </ProductCarousel>
          </section>
        )}
        
        
        {hasNewArrivals && (
          <section className="new-arrivals-section">
            <ProductCarousel 
              title="Just Arrived" 
              viewAllLink="/new-arrivals"
              itemsToShow={Math.min(4, newArrivalProducts.length)}
              autoPlay={newArrivalProducts.length > 1}
              autoPlayInterval={5000}
            >
              {newArrivalProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={{
                    ...product,
                    isNew: true
                  }} 
                  className="carousel-card"
                />
              ))}
            </ProductCarousel>
          </section>
        )}
        
        {hasBestSellers && (
          <section className="best-sellers-section">
            <ProductCarousel 
              title="Customer Favorites" 
              viewAllLink="/best-sellers"
              itemsToShow={Math.min(4, bestSellerProducts.length)}
              autoPlay={bestSellerProducts.length > 1}
            >
              {bestSellerProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={{
                    ...product,
                    isBestSeller: true,
                    isNew: false 
                  }} 
                  className="carousel-card"
                />
              ))}
            </ProductCarousel>
          </section>
        )}
        
        
        <div className="products-categories-wrapper">
  <section className="products-section">
    <div className="cards-grid">
      {phoneCards.map((card, index) => (
        <Link key={index} href={card.link} className="product-card">
          <div className="card-content">
            <h2>{card.name}</h2>
            <button className="view-all-btn">View All</button>
            <div className="card-image">
              <Image 
                src={card.image}
                alt={`${card.name} product`}
                width={243}
                height={243}
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        </Link>
      ))}
    </div>
  </section>
    
  <section className="categories-section">
    <div className="category-cards-grid">
      {categoryCards.map((card, index) => (
        <Link key={index} href={card.link} className="category-card">
          <div className="card-content">
            <h2>{card.name}</h2>
            <button className="view-all-btn">View All</button>
            <div className="card-image">
              <Image 
                src={card.image}
                alt={`${card.name} category`}
                width={243}
                height={243}
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        </Link>
      ))}
    </div>
  </section>
</div>

        <section className="features-section">
  <div className="feature">
    <div className="feature-icon">🚚</div>
    <h3>Canada Wide Shipping</h3>
    <p>On all orders</p>
  </div>
  <div className="feature">
    <div className="feature-icon">🔒</div>
    <h3>Secure Payment</h3>
    <p>100% secure checkout</p>
  </div>
  <div className="feature">
    <div className="feature-icon">🔄</div>
    <h3>30-Day Returns</h3>
    <p>No questions asked</p>
  </div>

</section>
      </main>
      
      
    </div>
  );
}

function getTimeFromSeconds(seconds) {
  if (seconds <= 0) return '0h 0m';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${hours}h ${minutes}m`;
}
