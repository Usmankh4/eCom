"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../../components/layout/Header';


export default function BrandPageClassic({ initialBrand, initialProducts = [] }) {
  const [brand, setBrand] = useState(initialBrand);
  const [phones, setPhones] = useState(initialProducts);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  // Function to get the full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/placeholder.png';
    if (imagePath.startsWith('http')) return imagePath;
    return `${apiUrl}${imagePath}`;
  };

  useEffect(() => {
    const fetchPhones = async () => {
      try {
        // Add cache-busting timestamp to prevent caching issues
        const timestamp = new Date().getTime();
        const response = await axios.get(`${apiUrl}/products/brand/${brand}?page=${currentPage}&t=${timestamp}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (response.data && Array.isArray(response.data)) {
          setPhones(response.data);
        } else if (response.data && response.data.results) {
          setPhones(response.data.results);
          if (response.data.count) {
            setPageCount(Math.ceil(response.data.count / 10));
          }
        }
      } catch (error) {
        console.error('Failed to load phones:', error instanceof Error ? error.message : 'Unknown error');
      }
    };
    
    // Only fetch if we don't have initial products or if the page changes
    if (initialProducts.length === 0 || currentPage > 1) {
      fetchPhones();
    }
  }, [brand, currentPage, initialProducts, apiUrl]);

  const handlePrevious = () => {
    setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    setCurrentPage(currentPage + 1);
  };

  return (
    <div>
      <div className="page-container">
        <div className="PhoneTitle">
          <h2>{brand.toUpperCase()}</h2>
          <div className="PhoneWrapper">
            <div className="PhoneLayout">
              {phones.map((phone) => (
                <div className="PhoneCard" key={phone.id || phone.slug || phone.name}>
                  <h4>{phone.name}</h4>
                  <Link href={`/product/${phone.slug}`}>
                    <div className="PhoneImage" style={{ width: 150, height: 200, position: 'relative' }}>
                      <Image 
                        src={getImageUrl(phone.image)}
                        alt={phone.name} 
                        fill
                        sizes="(max-width: 768px) 100vw, 150px"
                        style={{ 
                          objectFit: 'contain',
                          width: '100%',
                          height: '100%'
                        }}
                        onError={(e) => {
                          console.error(`Failed to load image for ${phone.name}`);
                          e.target.src = '/images/placeholder.png';
                        }}
                      />
                    </div>
                  </Link>
                  <div className="PhonePrice">
                    <h4>on sale for ${phone.price || phone.salePrice || '0.00'}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="pageButton">
              {currentPage > 1 && <button onClick={handlePrevious}>Previous</button>}
              {(pageCount > currentPage || phones.length >= 10) && <button onClick={handleNext}>Next</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
