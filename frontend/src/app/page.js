import Image from 'next/image';
import Link from 'next/link';
import Header from './components/header';
import { cache } from 'react';
import ProductCarousel from './components/ProductCarousel';
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
    { id: 'apple', name: 'Apple', link: '/phones/Apple', image: phoneImages.apple },
    { id: 'samsung', name: 'Samsung', link: '/phones/Samsung', image: phoneImages.samsung },
    { id: 'android', name: 'Android', link: '/phones/Android', image: phoneImages.google },
  ];

  const categoryCards = [
    { id: 'accessories', name: 'Accessories', link: '/products/Accessories', image: phoneImages.accessories },
    { id: 'tablets', name: 'Tablets', link: '/phones/Tablet', image: phoneImages.tablets },
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
  const flashDeal = [
    { id: 1, name: 'iPhone 15 Pro', originalPrice: 999, salePrice: 899, image: phoneImages.apple, discount: '10%', timeLeft: '5h 23m' },
    { id: 2, name: 'Samsung S24 Ultra', originalPrice: 1199, salePrice: 999, image: phoneImages.samsung, discount: '17%', timeLeft: '5h 23m' },
    { id: 3, name: 'Google Pixel 8', originalPrice: 799, salePrice: 699, image: phoneImages.google, discount: '12%', timeLeft: '5h 23m' },
  ];

  const newArrivals = [
    { id: 1, name: 'iPhone 15 Pro Max', price: 1099, image: phoneImages.apple, isNew: true },
    { id: 2, name: 'Samsung Galaxy Buds', price: 149, image: phoneImages.accessories, isNew: true },
    { id: 3, name: 'Google Pixel Tablet', price: 499, image: phoneImages.tablets, isNew: true },
  ];

  const bestSellers = [
    { id: 1, name: 'iPhone 14 Pro', price: 899, image: phoneImages.apple, rating: 4.8, reviewCount: 245 },
    { id: 2, name: 'Samsung S23', price: 799, image: phoneImages.samsung, rating: 4.7, reviewCount: 189 },
    { id: 3, name: 'Phone Charging Stand', price: 29.99, image: phoneImages.accessories, rating: 4.9, reviewCount: 412 },
  ];
  const bundleDeals = [
    { 
      id: 1, 
      name: 'iPhone Essentials Bundle', 
      items: ['iPhone 15', 'MagSafe Charger', 'Silicone Case', 'Screen Protector'],
      originalPrice: 1156, 
      bundlePrice: 999,
      image: phoneImages.apple 
    },
    { 
      id: 2, 
      name: 'Samsung Ultimate Pack', 
      items: ['Samsung S24', 'Wireless Charger', 'Galaxy Buds', 'Clear Case'],
      originalPrice: 1356, 
      bundlePrice: 1199,
      image: phoneImages.samsung 
    },
  ];

  const testimonials = [
    { id: 1, name: 'John D.', rating: 5, comment: 'Excellent service and quality products. My phone was repaired in under an hour!', date: '2 weeks ago' },
    { id: 2, name: 'Sarah M.', rating: 5, comment: 'The accessories I bought were exactly as described and arrived quickly. Will shop again!', date: '1 month ago' },
    { id: 3, name: 'Michael T.', rating: 4, comment: 'Great selection of phones and very knowledgeable staff. Highly recommend.', date: '3 weeks ago' },
  ];
  
  
  async function fetchHomePageData() {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/homepage/`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to fetch homepage data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      return {
        flash_deals: { phones: [], accessories: [] },
        new_arrivals: { phones: [], accessories: [] },
        best_sellers: { phones: [], accessories: [] }
      };
    }
  }

  async function fetchFlashSales() {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/promotions/active-flash-sales/', {cache: 'no-store'});
      if (!response.ok) {
        throw new Error('Failed to fetch flash deals data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching flash deals data:', error);
      return [];
    }
  }
  
  const newArrivalsArray = [
    ...(productData.new_arrivals?.phones || []),
    ...(productData.new_arrivals?.accessories || [])
  ];
  
  const newArrival = newArrivalsArray.map(product =>{
    return {
      id: product.id,
      name: product.name,
      originalPrice: parseFloat(product.price),
      salePrice: parseFloat(product.sale_price),
      image: product.image_url || '/images/placeholder.png',
      discount: product.discount_percentage ? `${product.discount_percentage}%` : 'Sale',
      timeLeft: product.flash_deal_end ? getTimeLeft(product.flash_deal_end) : '5h 23m',
      slug: product.slug,
      type: product.storage ? 'phone' : 'accessory',  
    }
  }).slice(0,5);

  const flashDealsArray = Array.isArray(flashSalesData) ? flashSalesData : [];
  const flashDeals = flashDealsArray.flatMap(flashSale => 
    flashSale.items.map(item => {
      const details = item.item_details;
      return {
        id: item.id,
        name: details.name || flashSale.name,
        originalPrice: parseFloat(item.original_price || details.price),
        salePrice: parseFloat(item.sale_price),
        image: details.image_url || details.image || '/images/placeholder.png',
        discount: item.discount_percentage ? `${item.discount_percentage}%` : 'Sale',
        timeLeft: flashSale.end_date ? getTimeLeft(flashSale.end_date) : '5h 23m',
        slug: details.slug || flashSale.slug,
        type: details.storage ? 'phone' : 'accessory'
      }
    })
  ).slice(0, 5);


  
  
  

  return (
    <div className="page-container">
      
      <main className="main-content">
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">REPAIR IS OUR SPECIALTY</h1>
              <div className="hero-buttons">
                <Link href="/products/Accessories">
                  <button className="btn btn-primary">Shop</button>
                </Link>
                <Link href="/repair">
                  <button className="btn btn-outline">Repair</button>
                </Link>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <Image 
              src={bannerImage} 
              alt="Phone Banner" 
              priority
              width={500}
              height={670}
              style={{ objectFit: 'contain' }}
            />
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
        
        <section className="flash-deals-section">
          <ProductCarousel 
            title="Flash Deals" 
            viewAllLink="/flash-deals"
            itemsToShow={5}
            autoPlay={true}
            autoPlayInterval={6000}
          >
            {flashDeals.map((product) => (
              <Link key={product.id} href={`/product/${product.slug}`} className="deal-card carousel-card">
                <div className="discount-badge">{product.discount} OFF</div>
                <div className="card-image">
                  <Image 
                    src={product.image}
                    alt={product.name}
                    width={200}
                    height={200}
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div className="card-content">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="price-container">
                    <span className="original-price">${product.originalPrice}</span>
                    <span className="sale-price">${product.salePrice}</span>
                  </div>
                  <button className="btn btn-primary btn-sm">Add to Cart</button>
                </div>
              </Link>
            ))}
          </ProductCarousel>
        </section>
        
        <section className="new-arrivals-section">
          <ProductCarousel 
            title="Just Arrived" 
            viewAllLink="/new-arrivals"
            itemsToShow={5}
            autoPlay={true}
            autoPlayInterval={5000}
          >
            {newArrival.map((product) => (
              <Link key={product.id} href={`/product/${product.slug}`} className="product-card new-arrival-card carousel-card">
                {product.isNew && <div className="new-badge">NEW</div>}
                <div className="card-image">
                  <Image 
                    src={product.image || '/images/placeholder.png'}
                    alt={product.name}
                    width={200}
                    height={200}
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div className="card-content">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="price">${product.originalPrice}</div>
                  <button className="btn btn-primary btn-sm">Add to Cart</button>
                </div>
              </Link>
            ))}
          </ProductCarousel>
        </section>
        
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

        <section className="best-sellers-section">
          <ProductCarousel 
            title="Customer Favorites" 
            viewAllLink="/best-sellers"
            itemsToShow={3}
          >
            {bestSellers.map((product) => (
              <Link key={product.id} href={`/product/${product.slug}`} className="product-card best-seller-card carousel-card">
                <div className="bestseller-badge">Best Seller</div>
                <div className="card-image">
                  <Image 
                    src={product.image}
                    alt={product.name}
                    width={200}
                    height={200}
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div className="card-content">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="price">${product.price}</div>
                  <div className="rating">
                    <span className="stars">{'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}</span>
                    <span className="review-count">({product.reviewCount})</span>
                  </div>
                  <button className="btn btn-primary btn-sm">Add to Cart</button>
                </div>
              </Link>
            ))}
          </ProductCarousel>
        </section>
        
        
        <section className="bundle-deals-section">
          <div className="section-header">
            <h2 className="section-title">Save with Bundles</h2>
            <Link href="/bundles" className="view-all-link">View All</Link>
          </div>
          <div className="bundles-grid">
            {bundleDeals.map((bundle) => (
              <Link key={bundle.id} href={`/bundle/${bundle.id}`} className="bundle-card">
                <div className="savings-badge">Save ${(bundle.originalPrice - bundle.bundlePrice).toFixed(2)}</div>
                <div className="card-image">
                  <Image 
                    src={bundle.image}
                    alt={bundle.name}
                    width={200}
                    height={200}
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div className="card-content">
                  <h3 className="bundle-name">{bundle.name}</h3>
                  <ul className="bundle-items">
                    {bundle.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                  <div className="price-container">
                    <span className="original-price">${bundle.originalPrice}</span>
                    <span className="bundle-price">${bundle.bundlePrice}</span>
                  </div>
                  <button className="btn btn-primary">Add Bundle to Cart</button>
                </div>
              </Link>
            ))}
          </div>
        </section>
        
        <section className="testimonials-section">
          <h2 className="section-title">What Our Customers Say</h2>
          <div className="testimonials-slider">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-card">
                <div className="testimonial-rating">
                  {'★'.repeat(testimonial.rating)}{'☆'.repeat(5 - testimonial.rating)}
                </div>
                <p className="testimonial-text">"{testimonial.comment}"</p>
                <div className="testimonial-author">
                  <span className="author-name">{testimonial.name}</span>
                  <span className="testimonial-date">{testimonial.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <section className="newsletter-section">
          <div className="newsletter-content">
            <h2 className="newsletter-title">Get 10% Off Your First Order</h2>
            <p className="newsletter-text">Subscribe to our newsletter for exclusive deals and updates</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Your email address" className="newsletter-input" required />
              <button type="submit" className="btn btn-primary">Subscribe</button>
            </form>
          </div>
        </section>
      </main>
      
      
    </div>
  );
}

function getTimeLeft(endTimeString) {
  const endTime = new Date(endTimeString);
  const now = new Date();
  const timeLeft = endTime - now;
 
  if (timeLeft <= 0) return '0h 0m';
 
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
}