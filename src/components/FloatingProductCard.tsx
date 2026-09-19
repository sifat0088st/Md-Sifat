import React from 'react';
import { Product } from '../types';

interface FloatingProductCardProps {
  product: Product;
  position: 'left1' | 'left2' | 'right1' | 'right2';
  parallaxOffset: { x: number; y: number };
  onClick: () => void;
}

export const FloatingProductCard: React.FC<FloatingProductCardProps> = ({
  product,
  position,
  parallaxOffset,
  onClick,
}) => {
  // Parallax sensitivity multiplier depending on position
  const multiplier = {
    left1: { x: 1.0, y: 1.0, delay: '0s', duration: '5.5s' },
    left2: { x: -0.8, y: 1.2, delay: '1.2s', duration: '6.5s' },
    right1: { x: -1.0, y: -0.9, delay: '0.6s', duration: '6.0s' },
    right2: { x: 0.9, y: -1.1, delay: '1.8s', duration: '7.0s' },
  }[position];

  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  // Compute transform based on parallax
  const px = parallaxOffset.x * multiplier.x;
  const py = parallaxOffset.y * multiplier.y;

  return (
    <div
      onClick={onClick}
      style={{
        transform: `translate3d(${px}px, ${py}px, 0)`,
        animationDelay: multiplier.delay,
        animationDuration: multiplier.duration,
      }}
      className="cursor-pointer group select-none animate-float-slow transition-transform duration-300 ease-out"
    >
      <div className="relative p-2.5 sm:p-3 rounded-2xl bg-white/80 backdrop-blur-md border border-pink-200/60 shadow-[0_8px_25px_rgba(236,72,153,0.12)] group-hover:shadow-[0_12px_32px_rgba(236,72,153,0.22)] group-hover:border-pink-400/80 group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300 w-52 sm:w-56">
        {/* Discount Badge */}
        {discountPercent && (
          <span className="absolute top-2 right-2 z-10 px-1.5 py-0.5 text-[10px] font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 rounded-full shadow-xs">
            -{discountPercent}%
          </span>
        )}

        <div className="flex items-center gap-3">
          {/* Product Image */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-pink-50 flex-shrink-0 border border-pink-100">
            <img
              src={product.imageUrl}
              alt={product.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          {/* Product Details */}
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-pink-600 truncate mb-0.5">
              {product.category || 'বই'}
            </p>
            <h4 className="text-xs sm:text-sm font-semibold text-[#2a0c24] line-clamp-1 group-hover:text-pink-600 transition-colors">
              {product.title}
            </h4>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xs sm:text-sm font-bold text-[#ec4899]">
                ৳{product.price}
              </span>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                  ৳{product.oldPrice}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
