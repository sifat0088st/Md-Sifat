import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { FloatingProductCard } from './FloatingProductCard';

interface HeroSectionProps {
  settings: StoreSettings;
  heroProducts: {
    left1?: Product;
    left2?: Product;
    right1?: Product;
    right2?: Product;
  };
  onProductClick: (product: Product) => void;
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  settings,
  heroProducts,
  onProductClick,
  onExploreClick,
}) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Parallax offset for floating cards
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });

  // Touch tracking for mobile scrubbing
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
  const videoDurationRef = useRef<number>(0);
  const isScrubbingRef = useRef<boolean>(false);
  const rafIdRef = useRef<number | null>(null);

  // Derive direct video mp4 URL if given Cloudinary embed URL
  const getVideoSrc = (url: string) => {
    if (!url) return '';
    if (url.includes('player.cloudinary.com/embed/')) {
      const matchCloud = url.match(/cloud_name=([^&]+)/);
      const matchId = url.match(/public_id=([^&]+)/);
      if (matchCloud && matchId) {
        return `https://res.cloudinary.com/${matchCloud[1]}/video/upload/${matchId[1]}.mp4`;
      }
    }
    return url;
  };

  const videoUrl = getVideoSrc(settings.heroVideoUrl);

  // Video duration ready handler
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      videoDurationRef.current = videoRef.current.duration || 0;
      // Auto-play silently
      videoRef.current.play().catch(() => {});
    }
  };

  // Smooth scrub video using requestAnimationFrame
  const seekVideoSmooth = useCallback((targetTime: number) => {
    if (!videoRef.current || !videoDurationRef.current) return;
    const clampedTime = Math.max(0, Math.min(targetTime, videoDurationRef.current));

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      if (videoRef.current && Math.abs(videoRef.current.currentTime - clampedTime) > 0.05) {
        videoRef.current.currentTime = clampedTime;
      }
    });
  }, []);

  // Desktop Mouse scrub and parallax tracking
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const hero = heroRef.current;
      if (!hero) return;

      const rect = hero.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left) / rect.width; // 0 to 1
      const centeredX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2); // -1 to 1
      const centeredY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2); // -1 to 1

      // Subtle parallax offset (maximum 12px)
      setParallaxOffset({
        x: Math.round(centeredX * 12),
        y: Math.round(centeredY * 12),
      });

      // Interactive timeline scrub: map relativeX to video duration
      if (videoDurationRef.current > 0) {
        const targetTime = relativeX * videoDurationRef.current;
        seekVideoSmooth(targetTime);
      }
    },
    [seekVideoSmooth]
  );

  const handleMouseLeave = useCallback(() => {
    // Reset parallax gently
    setParallaxOffset({ x: 0, y: 0 });
    // Resume standard playback if video paused
    if (videoRef.current && videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  // Mobile Touch Swipe Handling
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
      isHorizontalSwipeRef.current = null;
      isScrubbingRef.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartXRef.current;
    const deltaY = currentY - touchStartYRef.current;

    // Detect if this is horizontal swipe vs vertical scroll
    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
        isHorizontalSwipeRef.current = true;
      } else if (Math.abs(deltaY) > 10) {
        isHorizontalSwipeRef.current = false;
      }
    }

    if (isHorizontalSwipeRef.current && videoRef.current && videoDurationRef.current > 0) {
      const hero = heroRef.current;
      if (hero) {
        const rect = hero.getBoundingClientRect();
        // Swipe left (negative deltaX) -> forward; swipe right -> backward
        const scrubSensitivity = 1.2;
        const fractionChange = (-deltaX / rect.width) * scrubSensitivity;
        const targetTime = videoRef.current.currentTime + fractionChange * 2;
        seekVideoSmooth(targetTime);
        touchStartXRef.current = currentX;
      }
    }
  };

  const handleTouchEnd = () => {
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    isHorizontalSwipeRef.current = null;
    isScrubbingRef.current = false;
    if (videoRef.current && videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
    }
  };

  // Check which hero slots are populated
  const hasLeft1 = !!heroProducts.left1;
  const hasLeft2 = !!heroProducts.left2;
  const hasRight1 = !!heroProducts.right1;
  const hasRight2 = !!heroProducts.right2;
  const activeHeroProductsList = [
    heroProducts.left1,
    heroProducts.left2,
    heroProducts.right1,
    heroProducts.right2,
  ].filter(Boolean) as Product[];

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12 sm:pb-16 px-4"
    >
      {/* Background Media Container (Sitting behind content) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {settings.heroMediaType === 'image' ? (
          <img
            src={settings.heroVideoUrl || 'https://images.unsplash.com/photo-1507842229451-7f01beff9c0d?w=1600&auto=format&fit=crop&q=80'}
            alt="Hero background"
            className="w-full h-full object-cover filter brightness-[0.92]"
          />
        ) : (
          <video
            ref={videoRef}
            src={videoUrl}
            onLoadedMetadata={handleLoadedMetadata}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover filter brightness-[0.88] opacity-80"
          />
        )}

        {/* Soft Modern Glass & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#fdf2f8]/70 via-[#fdf2f8]/50 to-[#fdf2f8]" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#fdf2f8]/30 to-[#fdf2f8]/90" />
      </div>

      {/* Desktop Floating Product Cards (Four Slots: left1, left2, right1, right2) */}
      <div className="hidden lg:block absolute inset-0 max-w-7xl mx-auto pointer-events-none z-20">
        {/* Top Left Slot */}
        {hasLeft1 && heroProducts.left1 && (
          <div className="absolute top-28 left-6 pointer-events-auto">
            <FloatingProductCard
              product={heroProducts.left1}
              position="left1"
              parallaxOffset={parallaxOffset}
              onClick={() => onProductClick(heroProducts.left1!)}
            />
          </div>
        )}

        {/* Bottom Left Slot */}
        {hasLeft2 && heroProducts.left2 && (
          <div className="absolute bottom-16 left-8 pointer-events-auto">
            <FloatingProductCard
              product={heroProducts.left2}
              position="left2"
              parallaxOffset={parallaxOffset}
              onClick={() => onProductClick(heroProducts.left2!)}
            />
          </div>
        )}

        {/* Top Right Slot */}
        {hasRight1 && heroProducts.right1 && (
          <div className="absolute top-28 right-6 pointer-events-auto">
            <FloatingProductCard
              product={heroProducts.right1}
              position="right1"
              parallaxOffset={parallaxOffset}
              onClick={() => onProductClick(heroProducts.right1!)}
            />
          </div>
        )}

        {/* Bottom Right Slot */}
        {hasRight2 && heroProducts.right2 && (
          <div className="absolute bottom-16 right-8 pointer-events-auto">
            <FloatingProductCard
              product={heroProducts.right2}
              position="right2"
              parallaxOffset={parallaxOffset}
              onClick={() => onProductClick(heroProducts.right2!)}
            />
          </div>
        )}
      </div>

      {/* Hero Center Content (Entrance Animation: Fade In + Slight Upward Movement) */}
      <div className="relative z-10 max-w-3xl mx-auto text-center animate-fadeIn px-2">
        {/* Subtitle Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-pink-200 shadow-sm text-pink-600 text-xs sm:text-sm font-semibold mb-6 tracking-wide hover:border-pink-300 transition-colors">
          <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
          <span>{settings.tagline || 'বাংলাদেশে অন্যতম একটি আধুনিক লাইব্রেরী'}</span>
        </div>

        {/* Main Website Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#2a0c24] tracking-tight leading-[1.2] mb-5">
          {settings.websiteName || 'তিতাস লাইব্রেরি'}
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
          {settings.description || 'তিতাস লাই বিড়ি বাংলাদেশে অন্যতম একটি লাইব্রেরী। আপনার পছন্দের বই ও শিক্ষা সামগ্রী সরাসরি অর্ডার করুন সহজে।'}
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-6">
          <button
            onClick={onExploreClick}
            className="flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-full bg-gradient-to-r from-[#ec4899] to-[#f43f5e] text-white font-semibold text-sm sm:text-base shadow-[0_4px_16px_rgba(236,72,153,0.35)] hover:shadow-[0_6px_22px_rgba(236,72,153,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <span>পণ্যসমূহ দেখুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('আসসালামু আলাইকুম, আমি তিতাস লাইব্রেরি থেকে বই অর্ডার করতে চাই।')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 sm:px-7 py-3.5 rounded-full bg-white/85 text-emerald-700 border border-emerald-300 font-semibold text-sm sm:text-base backdrop-blur-md shadow-xs hover:bg-emerald-50 hover:border-emerald-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <span>সরাসরি হোয়াটসঅ্যাপ</span>
          </a>
        </div>

        {/* Interaction Hint for Interactive Video Scrub */}
        <div className="text-[11px] sm:text-xs text-pink-700/80 font-medium flex items-center justify-center gap-1.5 mt-2">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
          <span>মাউস নাড়িয়ে বা মোবাইল সোয়াইপ করে ব্যাকগ্রাউন্ড ভিডিও নিয়ন্ত্রণ করুন</span>
        </div>

        {/* Mobile / Tablet Compact Carousel for Hero Products */}
        {activeHeroProductsList.length > 0 && (
          <div className="lg:hidden mt-8 pt-4">
            <p className="text-xs font-semibold text-pink-800 mb-3 flex items-center justify-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-pink-600" />
              <span>নির্বাচিত পণ্যসমূহ</span>
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2 px-2 no-scrollbar justify-start sm:justify-center">
              {activeHeroProductsList.map((product) => (
                <div key={product.id} className="flex-shrink-0">
                  <FloatingProductCard
                    product={product}
                    position="left1"
                    parallaxOffset={{ x: 0, y: 0 }}
                    onClick={() => onProductClick(product)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
