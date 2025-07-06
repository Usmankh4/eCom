'use client';

import React, { useRef, useEffect, useState, ReactNode } from 'react';
import Link from 'next/link';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from './ProductCarousel.module.css';

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
          slidesToShow: Math.min(itemsToShow, 4),
          slidesToScroll: 1,
          dots: true
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: Math.min(itemsToShow, 3),
          slidesToScroll: 1,
          dots: true
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(itemsToShow, 2),
          slidesToScroll: 1,
          arrows: false,
          dots: true
        }
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          dots: true
        }
      }
    ];
  };

  const settings = {
    dots: true,
    infinite: infinite,
    speed: 300,
    slidesToShow: itemsToShow,
    slidesToScroll: slidesToScroll,
    autoplay: autoPlay,
    autoplaySpeed: autoPlayInterval,
    responsive: getResponsiveSettings(),
    pauseOnHover: true,
    swipeToSlide: true,
    arrows: windowWidth > 768, // Only show arrows on desktop
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    dotsClass: `${styles.slickDots} slick-dots`,
    appendDots: (dots: ReactNode) => (
      <div className={styles.slickDotsContainer}>
        <ul className={styles.slickDotsList}>{dots}</ul>
      </div>
    ),
    customPaging: () => (
      <button className={styles.slickDot} aria-label="Go to slide" />
    )
  };

  // Custom arrow components with updated classes
  function NextArrow(props: ArrowProps) {
    const { className, style, onClick } = props;
    return (
      <button
        className={`${styles.carouselNavButton} ${styles.carouselNavNext} ${className || ''}`}
        style={{ ...style }}
        onClick={onClick}
        aria-label="Next slide"
        type="button"
      >
        <svg className={styles.carouselNavIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );
  }
  
  function PrevArrow(props: ArrowProps) {
    const { className, style, onClick } = props;
    return (
      <button
        className={`${styles.carouselNavButton} ${styles.carouselNavPrev} ${className || ''}`}
        style={{ ...style }}
        onClick={onClick}
        aria-label="Previous slide"
        type="button"
      >
        <svg className={styles.carouselNavIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    );
  }

  return (
    <section className={styles.productCarouselSection}>
      <div className={styles.carouselHeader}>
        <h2 className={styles.carouselTitle}>{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink} className={styles.carouselViewAll}>
            View All
          </Link>
        )}
      </div>
      
      <div className={styles.carouselContainer}>
        <Slider 
          ref={sliderRef} 
          {...settings}
          className={styles.carouselSlider}
        >
          {React.Children.map(children, (child, index) => (
            <div key={index} className={styles.carouselSlide}>
              {child}
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default ProductCarousel;
