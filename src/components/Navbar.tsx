import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Menu, MessageCircle, X } from 'lucide-react';
import { BrandEmblem } from './BrandEmblem';

interface NavbarProps {
  activeSection: string;
  onOpenWhatsApp: (defaultProduct?: 'chickens' | 'chicks' | 'eggs') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onOpenWhatsApp,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 18);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setProductsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    setProductsDropdownOpen(false);
    const id = href.replace('#', '');
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-200 border-b ${
        scrolled
          ? 'bg-[#F5EBD6]/95 border-[#D6C19B] shadow-xs'
          : 'bg-[#F5EBD6]/85 border-[#E2CFAF]/70'
      }`}
    >
      <div className="max-w-[1220px] mx-auto px-3.5 sm:px-6 lg:px-8 h-[68px] sm:h-[70px] flex items-center justify-between gap-2 sm:gap-6 lg:gap-8">
        {/* Zone 1: Brand Lockup (Single-Line Wordmark) */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('#home');
          }}
          className="flex items-center gap-2 sm:gap-2.5 whitespace-nowrap group min-w-0 overflow-hidden"
        >
          <BrandEmblem
            variant="dark"
            className="w-7 h-7 sm:w-9 sm:h-9 shrink-0 transition-transform duration-200 group-hover:scale-105"
          />
          <span className="font-display text-[14px] sm:text-xl font-bold tracking-tight text-[#1E241E] truncate">
            Kadaknath Poultry Farm
          </span>
        </a>

        {/* Zone 2: Concise Single-Line Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center lg:gap-4 xl:gap-6 text-sm font-medium text-[#2A332A]"
        >
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('#home');
            }}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'home'
                ? 'border-[#1B3B22] text-[#1B3B22] font-semibold'
                : 'border-transparent hover:border-[#C89B3C] hover:text-[#1B3B22]'
            }`}
          >
            Home
          </a>

          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('#about');
            }}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'about'
                ? 'border-[#1B3B22] text-[#1B3B22] font-semibold'
                : 'border-transparent hover:border-[#C89B3C] hover:text-[#1B3B22]'
            }`}
          >
            About Us
          </a>

          {/* Our Products with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProductsDropdownOpen((prev) => !prev)}
              aria-expanded={productsDropdownOpen}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1 cursor-pointer ${
                activeSection === 'products'
                  ? 'border-[#1B3B22] text-[#1B3B22] font-semibold'
                  : 'border-transparent hover:border-[#C89B3C] hover:text-[#1B3B22]'
              }`}
            >
              <span>Our Products</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  productsDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {productsDropdownOpen && (
              <div
                role="menu"
                className="absolute left-0 mt-2 w-56 rounded-xl bg-[#FAF3E3] border border-[#D4BE98] shadow-lg py-2 z-50"
              >
                <a
                  href="#products"
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick('#products');
                  }}
                  className="block px-4 py-2 text-sm text-[#1E241E] hover:bg-[#EFE2C6] font-medium transition-colors"
                >
                  All Farm Products
                </a>
                <div className="my-1 border-t border-[#E4D3B3]" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setProductsDropdownOpen(false);
                    onOpenWhatsApp('chickens');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-[#2A332A] hover:bg-[#EFE2C6] hover:text-[#1B3B22] transition-colors cursor-pointer"
                >
                  Kadaknath Chickens
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setProductsDropdownOpen(false);
                    onOpenWhatsApp('chicks');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-[#2A332A] hover:bg-[#EFE2C6] hover:text-[#1B3B22] transition-colors cursor-pointer"
                >
                  Kadaknath Chicks
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setProductsDropdownOpen(false);
                    onOpenWhatsApp('eggs');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-[#2A332A] hover:bg-[#EFE2C6] hover:text-[#1B3B22] transition-colors cursor-pointer"
                >
                  Kadaknath Eggs
                </button>
              </div>
            )}
          </div>

          <a
            href="#gallery"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('#gallery');
            }}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'gallery'
                ? 'border-[#1B3B22] text-[#1B3B22] font-semibold'
                : 'border-transparent hover:border-[#C89B3C] hover:text-[#1B3B22]'
            }`}
          >
            Gallery
          </a>

          <a
            href="#why-us"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('#why-us');
            }}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'why-us'
                ? 'border-[#1B3B22] text-[#1B3B22] font-semibold'
                : 'border-transparent hover:border-[#C89B3C] hover:text-[#1B3B22]'
            }`}
          >
            Why Choose Us
          </a>

          <a
            href="#reviews"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('#reviews');
            }}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'reviews'
                ? 'border-[#1B3B22] text-[#1B3B22] font-semibold'
                : 'border-transparent hover:border-[#C89B3C] hover:text-[#1B3B22]'
            }`}
          >
            Feedback
          </a>

          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('#contact');
            }}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'contact'
                ? 'border-[#1B3B22] text-[#1B3B22] font-semibold'
                : 'border-transparent hover:border-[#C89B3C] hover:text-[#1B3B22]'
            }`}
          >
            Contact Us
          </a>
        </nav>

        {/* Zone 3: Primary Action + Mobile Menu Trigger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onOpenWhatsApp()}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-[#1B3B22] hover:bg-[#132B18] active:scale-[0.98] text-[#FAF3E3] text-xs sm:text-sm font-semibold shadow-xs transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
          >
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DFB75E]" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-lg border border-[#D4BE98] bg-[#FAF3E3] text-[#1E241E] hover:bg-[#EFE2C6] transition-colors cursor-pointer shrink-0"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Animated Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#FAF3E3] border-t border-[#D6C19B] px-4 py-4 shadow-md">
          <nav
            aria-label="Mobile Navigation"
            className="flex flex-col space-y-1"
          >
            {[
              { label: 'Home', href: '#home' },
              { label: 'About Us', href: '#about' },
              { label: 'Our Products', href: '#products' },
              { label: 'Gallery', href: '#gallery' },
              { label: 'Why Choose Us', href: '#why-us' },
              { label: 'Customer Feedback', href: '#reviews' },
              { label: 'Contact Us', href: '#contact' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href);
                }}
                className="px-3 py-3 rounded-lg text-base font-medium text-[#1E241E] hover:bg-[#EFE2C6] hover:text-[#1B3B22] transition-colors min-h-[44px] flex items-center"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
