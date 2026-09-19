import React from 'react';
import { ShoppingCart, MessageCircle, Eye } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  whatsappNumber: string;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  whatsappNumber,
  onViewDetails,
  onAddToCart,
}) => {
  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  const cleanWhatsApp = whatsappNumber.replace(/[^0-9]/g, '');
  const orderMessage = encodeURIComponent(
    `আসসালামু আলাইকুম! আমি "${product.title}" (মূল্য: ৳${product.price}) সরাসরি অর্ডার করতে চাই।`
  );
  const whatsappUrl = `https://wa.me/${cleanWhatsApp}?text=${orderMessage}`;

  return (
    <div className="group relative bg-white/90 rounded-2xl border border-pink-100/90 shadow-[0_4px_16px_rgba(236,72,153,0.06)] hover:shadow-[0_8px_24px_rgba(236,72,153,0.14)] hover:border-pink-300 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Discount Badge & Status */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
        {discountPercent ? (
          <span className="px-2 py-0.5 text-[11px] font-bold text-white bg-gradient-to-r from-[#ec4899] to-[#f43f5e] rounded-full shadow-xs">
            -{discountPercent}%
          </span>
        ) : (
          <span />
        )}

        {!product.available && (
          <span className="px-2 py-0.5 text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-full">
            স্টক শেষ
          </span>
        )}
      </div>

      {/* Image container */}
      <div
        onClick={() => onViewDetails(product)}
        className="relative aspect-square w-full bg-pink-50/50 overflow-hidden cursor-pointer"
      >
        <img
          src={product.imageUrl}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80';
          }}
        />
      </div>

      {/* Card Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <span className="text-[11px] font-medium text-pink-600 uppercase tracking-wider block mb-1">
            {product.category || 'সাধারণ'}
          </span>

          {/* Title */}
          <h4
            onClick={() => onViewDetails(product)}
            className="text-sm sm:text-base font-bold text-[#2a0c24] line-clamp-2 leading-snug cursor-pointer hover:text-pink-600 transition-colors mb-2"
          >
            {product.title}
          </h4>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-base sm:text-lg font-bold text-[#ec4899]">
              ৳{product.price}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                ৳{product.oldPrice}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons: "বিস্তারিত" and "অর্ডার" WhatsApp */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-pink-50">
          <button
            onClick={() => onViewDetails(product)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-pink-50 hover:bg-pink-100/80 text-pink-700 text-xs font-semibold transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>বিস্তারিত</span>
          </button>

          {product.available ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>অর্ডার</span>
            </a>
          ) : (
            <button
              disabled
              className="py-2 px-3 rounded-xl bg-gray-100 text-gray-400 text-xs font-semibold cursor-not-allowed text-center"
            >
              অপ্রতুল
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
