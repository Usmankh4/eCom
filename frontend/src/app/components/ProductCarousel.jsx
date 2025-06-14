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
  autoPlay = false,
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
          slidesToScroll: 1,
          variableWidth: true
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: Math.min(itemsToShow, 2),
          slidesToScroll: 1,
          variableWidth: true
        }
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          variableWidth: false
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
    vertical: false,
    rtl: false,
    centerMode: false,
    adaptiveHeight: false,
    cssEase: 'ease-out',
    swipeToSlide: true,
    variableWidth: true
  };

  function NextArrow(props) {
    const { className, onClick } = props;
    return (
      <div
        className={`${className} carousel-arrow carousel-arrow-next`}
        onClick={onClick}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    );
  }
  
  function PrevArrow(props) {
    const { className, onClick } = props;
    return (
      <div
        className={`${className} carousel-arrow carousel-arrow-prev`}
        onClick={onClick}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </div>
    );
  }

  return (
    <div className="product-carousel-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {viewAllLink && <Link href={viewAllLink} className="view-all-link">View All</Link>}
      </div>
      
      <div className="carousel-container">
        <Slider ref={sliderRef} {...settings}>
          {React.Children.map(children, (child) => (
            <div className="carousel-item-wrapper">
              {child}
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default ProductCarousel;
