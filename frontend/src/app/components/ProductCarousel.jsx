'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const ProductCarousel = ({ 
  children,
  title, 
  viewAllLink, 
  itemsToShow = 4,
  slidesToScroll = 1,
  autoPlay = true,
  autoPlayInterval = 3000,
  infinite = true
}) => {
  const sliderRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(0);
  
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
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    cssEase: 'cubic-bezier(0.45, 0, 0.55, 1)',
    pauseOnHover: true,
    swipeToSlide: true
  };

  function NextArrow(props) {
    const { className, onClick } = props;
    return (
      <button
        className="carousel-nav-button carousel-nav-next"
        onClick={onClick}
        aria-label="Next slide"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    );
  }
  
  function PrevArrow(props) {
    const { className, onClick } = props;
    return (
      <button
        className="carousel-nav-button carousel-nav-prev"
        onClick={onClick}
        aria-label="Previous slide"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      
      <div className="carousel-wrapper">
        <Slider ref={sliderRef} {...settings}>
          {React.Children.map(children, (child) => (
            <div className="carousel-slide">
              {child}
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default ProductCarousel;
