import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Menu, X, ShieldCheck, BookOpen } from 'lucide-react';
import { StoreSettings } from '../types';

interface NavbarProps {
  settings: StoreSettings;
  cartCount: number;
  onOpenCart: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  cartCount,
  onOpenCart,
  activeSection,
  onNavigate,
  onOpenAdmin,
  isAdminLoggedIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const navContainerRef = useRef<HTMLDivElement>(null);
  const navItemRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cursor following indicator on nav items
  useEffect(() => {
    const targetKey = hoveredNav || activeSection;
    const el = navItemRefs.current[targetKey];
    const container = navContainerRef.current;

    if (el && container) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setIndicatorStyle({
        left: elRect.left - containerRect.left,
        width: elRect.width,
        opacity: 1,
      });
    } else {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [hoveredNav, activeSection]);

  const navItems = [
    { id: 'home', label: 'হোম' },
    { id: 'categories', label: 'ক্যাটাগরি' },
    { id: 'shop', label: 'বই ও পণ্য' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-3 sm:px-6 pt-3 sm:pt-4 transition-all duration-300 pointer-events-none">
      <div
        className={`max-w-6xl mx-auto rounded-full transition-all duration-300 pointer-events-auto ${
          scrolled
            ? 'bg-white/85 shadow-sm border border-pink-200/60 backdrop-blur-md py-2 px-4 sm:px-6'
            : 'bg-white/70 shadow-[0_4px_20px_rgba(236,72,153,0.06)] border border-white/60 backdrop-blur-md py-2.5 px-4 sm:px-6'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Brand Logo & Name (Loaded dynamically from Firestore) */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded-lg p-1"
          >
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.websiteName}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-pink-200 group-hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-bold text-base sm:text-lg text-[#2a0c24] tracking-tight leading-tight group-hover:text-pink-600 transition-colors">
                {settings.websiteName || 'তিতাস লাইব্রেরি'}
              </span>
              <span className="text-[11px] text-pink-600 font-medium hidden sm:inline-block">
                অনলাইন বুকশপ
              </span>
            </div>
          </button>

          {/* Desktop Center Nav with Cursor Follow Indicator */}
          <nav
            ref={navContainerRef}
            className="hidden md:flex items-center relative rounded-full bg-pink-50/60 p-1 border border-pink-100/80"
          >
            {/* Animated Hover / Active indicator pill */}
            <div
              className="absolute top-1 bottom-1 rounded-full bg-white shadow-sm border border-pink-200/50 transition-all duration-300 ease-out pointer-events-none"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.opacity,
              }}
            />

            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  ref={(el) => (navItemRefs.current[item.id] = el)}
                  onClick={() => handleNavClick(item.id)}
                  onMouseEnter={() => setHoveredNav(item.id)}
                  onMouseLeave={() => setHoveredNav(null)}
                  className={`relative z-10 px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                    isActive
                      ? 'text-pink-600 font-semibold'
                      : 'text-gray-700 hover:text-pink-600'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Cart & Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin shortcut if logged in */}
            {isAdminLoggedIn && (
              <button
                onClick={onOpenAdmin}
                title="অ্যাডমিন প্যানেল"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full hover:bg-emerald-100 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>অ্যাডমিন</span>
              </button>
            )}

            {/* Cart Drawer Trigger */}
            <button
              onClick={onOpenCart}
              aria-label="শপিং কার্ট"
              className="relative flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#ec4899] to-[#f43f5e] text-white font-medium text-xs sm:text-sm shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden xs:inline">কার্ট</span>
              {cartCount > 0 && (
                <span className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-white text-pink-600 text-xs font-bold shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="মেনু খুলুন"
              className="md:hidden p-2 rounded-full text-gray-700 hover:text-pink-600 hover:bg-pink-50 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-pink-100 flex flex-col gap-1 pb-1 animate-fadeIn">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? 'bg-pink-100/70 text-pink-700 font-semibold'
                    : 'text-gray-700 hover:bg-pink-50 hover:text-pink-600'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 rounded-xl text-xs font-medium text-gray-500 hover:bg-pink-50 hover:text-pink-600 flex items-center gap-2 mt-1"
            >
              <ShieldCheck className="w-4 h-4 text-pink-500" />
              অ্যাডমিন পোর্টাল
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
