'use client';

import React, { useRef, useEffect, useState, ReactNode } from 'react';
import Link from 'next/link';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface ProductCarouselProps {
  children: ReactNode;
  title: string;
  viewAllLink?: string;
  itemsToShow?: number;
  slidesToScroll?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  infinite?: boolean;
}

interface ArrowProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ 
  children,
  title, 
  viewAllLink, 
  itemsToShow = 4,
  slidesToScroll = 1,
  autoPlay = true,
  autoPlayInterval = 3000,
  infinite = true
}) => {
  const sliderRef = useRef<Slider | null>(null);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    handleResize();
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const getResponsiveSettings = () => {
    return [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: Math.min(itemsToShow, 3),
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: Math.min(itemsToShow, 2),
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ];
  };

  const settings = {
    dots: true,
    infinite: infinite,
    speed: 500,
    slidesToShow: itemsToShow,
    slidesToScroll: slidesToScroll,
    autoplay: autoPlay,
    autoplaySpeed: autoPlayInterval,
    responsive: getResponsiveSettings(),
    cssEase: 'cubic-bezier(0.45, 0, 0.55, 1)',
    pauseOnHover: true,
    swipeToSlide: true,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    appendDots: (dots: ReactNode) => (
      <div style={{ position: 'absolute', bottom: '-40px', width: '100%' }}>
        <ul style={{ margin: '0', padding: '0', textAlign: 'center' }}>{dots}</ul>
      </div>
    ),
    customPaging: () => (
      <button className="slick-dot"></button>
    )
  };

  // Custom arrow components with updated classes
  function NextArrow(props: ArrowProps) {
    const { className, onClick } = props;
    return (
      <button
        className={`carousel-nav-button carousel-nav-next ${className || ''}`}
        onClick={onClick}
        aria-label="Next slide"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    );
  }
  
  function PrevArrow(props: ArrowProps) {
    const { className, onClick } = props;
    return (
      <button
        className={`carousel-nav-button carousel-nav-prev ${className || ''}`}
        onClick={onClick}
        aria-label="Previous slide"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
    );
  }

  return (
    <section className="product-carousel-section">
      <div className="carousel-header">
        <h2 className="carousel-title">{title}</h2>
        {viewAllLink && <Link href={viewAllLink} className="carousel-view-all">View All</Link>}
      </div>
      
      <div className="carousel-container">
        <Slider ref={sliderRef} {...settings}>
          {React.Children.map(children, (child) => (
            <div>
              {child}
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default ProductCarousel;
