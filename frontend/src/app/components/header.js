'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Memoize isActive function with useCallback
  const isActive = useCallback((path) => pathname === path, [pathname]);

  const toggleSearch = useCallback(() => {
    setIsSearchOpen(prev => !prev);
    // Close mobile menu if open
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
    // Close search if open
    if (isSearchOpen) setIsSearchOpen(false);
  }, [isSearchOpen]);

  // Navigation links data
  const navLinks = [
    { path: '/', label: 'HOME' },
    { path: '/phones/Apple', label: 'APPLE' },
    { path: '/phones/Samsung', label: 'SAMSUNG' },
    { path: '/phones/Android', label: 'ANDROID' },
    { path: '/phones/Tablet', label: 'TABLET' },
    { path: '/accessories', label: 'ACCESSORIES' },
    { path: '/repair', label: 'REPAIR' },
    { path: '/contactus', label: 'CONTACT US' }
  ];

  return (
    <header className="header" role="banner">
      <div className="headerTop">
        <div className="headerTopLeft">
          <Link href="/" aria-label="Zain Wireless Home">
            <h2>ZAIN WIRELESS</h2>
          </Link>
        </div>
        
        <div className="headerTopRight">
          
          <button 
            className="mobileMenuToggle"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            <span className={`hamburgerIcon ${isMobileMenuOpen ? 'active' : ''}`}></span>
          </button>
          
          <button 
            className="iconButton"
            onClick={toggleSearch}
            aria-label="Search"
          >
            <svg className="svgIcon" width="20" height="20" viewBox="0 0 20 20">
              <path d="M18.125,15.804l-4.038-4.037c0.675-1.079,1.012-2.308,1.01-3.534C15.089,4.62,12.199,1.75,8.584,1.75C4.815,1.75,1.982,4.726,2,8.286c0.021,3.577,2.908,6.549,6.578,6.549c1.241,0,2.417-0.347,3.44-0.985l4.032,4.026c0.167,0.166,0.43,0.166,0.596,0l1.479-1.478C18.292,16.234,18.292,15.968,18.125,15.804 M8.578,13.99c-3.198,0-5.716-2.593-5.733-5.71c-0.017-3.084,2.438-5.686,5.74-5.686c3.197,0,5.625,2.493,5.64,5.624C14.242,11.548,11.621,13.99,8.578,13.99 M16.349,16.981l-3.637-3.635c0.131-0.11,0.721-0.695,0.876-0.884l3.642,3.639L16.349,16.981z"></path>
            </svg>
          </button>
        </div>
      </div>

      <hr className="headerDivider" />

      <nav className={`headerBottom ${isMobileMenuOpen ? 'mobileMenuOpen' : ''}`} aria-label="Main navigation">
        <ul className="navList">
          {navLinks.map((link) => (
            <li 
              key={link.path} 
              className={`navItem ${isActive(link.path) ? 'activeLink' : 'link'}`}
            >
              <Link href={link.path}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </nav>

      {isSearchOpen && (
        <div className="searchBar" role="search">
          <div className="searchContainer">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="searchInput"
              autoFocus
              aria-label="Search products"
            />
            <button 
              className="closeSearch"
              onClick={toggleSearch}
              aria-label="Close search"
            >
              
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;