import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingCart, MessageCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  whatsappNumber: string;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  whatsappNumber,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  if (!product) return null;

  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const cleanWhatsApp = whatsappNumber.replace(/[^0-9]/g, '');
  const totalPrice = product.price * quantity;
  const directOrderMessage = encodeURIComponent(
    `আসসালামু আলাইকুম! আমি তিতাস লাইব্রেরি থেকে নিচের পণ্যটি অর্ডার করতে আগ্রহী:\n` +
      `পণ্য: ${product.title}\n` +
      `পরিমাণ: ${quantity} টি\n` +
      `একক মূল্য: ৳${product.price}\n` +
      `সর্বমোট: ৳${totalPrice}\n\n` +
      `দয়া করে ডেলিভারির প্রক্রিয়াটি নিশ্চিত করুন।`
  );
  const whatsappUrl = `https://wa.me/${cleanWhatsApp}?text=${directOrderMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="বন্ধ করুন"
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-pink-100 text-gray-700 hover:text-pink-600 transition-colors shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-5 sm:p-7 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Product Image */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-pink-50/50 border border-pink-100">
            {discountPercent && (
              <span className="absolute top-3 left-3 z-10 px-2.5 py-1 text-xs font-bold text-white bg-gradient-to-r from-[#ec4899] to-[#f43f5e] rounded-full shadow-xs">
                -{discountPercent}% ছাড়
              </span>
            )}
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-pink-600 uppercase tracking-wide">
              {product.category || 'সাধারণ বই'}
            </span>

            <h2 className="text-xl sm:text-2xl font-bold text-[#2a0c24] mt-1 mb-3 leading-snug">
              {product.title}
            </h2>

            {/* Price section */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-extrabold text-[#ec4899]">
                ৳{product.price}
              </span>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-base text-gray-400 line-through">
                  ৳{product.oldPrice}
                </span>
              )}
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2 mb-4">
              {product.available ? (
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ইন স্টক (অর্ডারের জন্য প্রস্তুত)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-medium text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>বর্তমানে স্টক শেষ</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                বিবরণ
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-pink-50/30 p-3 rounded-xl border border-pink-50">
                {product.description || 'এই পণ্যের কোনো বিস্তারিত বিবরণ প্রদান করা হয়নি।'}
              </p>
            </div>

            {/* Quantity Selector */}
            {product.available && (
              <div className="mb-6 flex items-center justify-between bg-pink-50/50 p-2.5 rounded-2xl border border-pink-100">
                <span className="text-xs sm:text-sm font-semibold text-gray-700">
                  পরিমাণ নির্ধারণ করুন:
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-full bg-white text-pink-600 shadow-xs flex items-center justify-center hover:bg-pink-100 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-sm text-[#2a0c24] min-w-5 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 rounded-full bg-white text-pink-600 shadow-xs flex items-center justify-center hover:bg-pink-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2.5">
              {product.available ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#ec4899] to-[#f43f5e] text-white font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{addedNotice ? 'কার্টে যুক্ত করা হয়েছে!' : 'কার্টে যোগ করুন'}</span>
                  </button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>হোয়াটসঅ্যাপে সরাসরি অর্ডার</span>
                  </a>
                </>
              ) : (
                <button
                  disabled
                  className="w-full py-3 rounded-xl bg-gray-200 text-gray-500 font-semibold text-sm cursor-not-allowed text-center"
                >
                  পণ্যটি বর্তমানে উপলভ্য নয়
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
