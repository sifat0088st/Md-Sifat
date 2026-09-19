import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  deliveryCharge: number;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  deliveryCharge,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const total = cartItems.length > 0 ? subtotal + deliveryCharge : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-pink-100">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-pink-100 flex items-center justify-between bg-pink-50/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#2a0c24]">
                শপিং কার্ট ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
              </h3>
            </div>

            <button
              onClick={onClose}
              aria-label="বন্ধ করুন"
              className="p-1.5 rounded-full hover:bg-pink-100 text-gray-500 hover:text-pink-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                <ShoppingBag className="w-12 h-12 text-pink-200 mb-3" />
                <p className="text-sm font-semibold text-gray-700">
                  আপনার কার্ট বর্তমানে খালি
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  পছন্দের বই বা পণ্য বেছে নিয়ে কার্টে যোগ করুন।
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 p-3 rounded-2xl bg-pink-50/30 border border-pink-100/80 items-center justify-between"
                >
                  {/* Image */}
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.title}
                    className="w-14 h-14 rounded-xl object-cover bg-white border border-pink-100 flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150&auto=format&fit=crop&q=80';
                    }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-[#2a0c24] truncate">
                      {item.product.title}
                    </h4>
                    <p className="text-xs font-bold text-[#ec4899] mt-0.5">
                      ৳{item.product.price}
                    </p>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="w-6 h-6 rounded-md bg-white border border-pink-200 text-pink-600 flex items-center justify-center hover:bg-pink-50"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-gray-800 min-w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="w-6 h-6 rounded-md bg-white border border-pink-200 text-pink-600 flex items-center justify-center hover:bg-pink-50"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    aria-label="পণ্য মুছুন"
                    className="p-2 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer with Calculations & Checkout */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-pink-100 bg-pink-50/20 space-y-3">
              {/* Clear Cart button */}
              <div className="flex justify-end">
                <button
                  onClick={onClearCart}
                  className="text-xs text-rose-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  কার্ট খালি করুন
                </button>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs sm:text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>সাবটোটাল:</span>
                  <span className="font-semibold text-gray-800">৳{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>ডেলিভারি চার্জ:</span>
                  <span className="font-semibold text-gray-800">
                    ৳{deliveryCharge}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-pink-100 text-sm sm:text-base font-bold text-[#2a0c24]">
                  <span>সর্বমোট:</span>
                  <span className="text-[#ec4899]">৳{total}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#ec4899] to-[#f43f5e] text-white font-semibold text-sm shadow-[0_4px_15px_rgba(236,72,153,0.3)] hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <span>অর্ডার সম্পন্ন করতে এগিয়ে যান</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
