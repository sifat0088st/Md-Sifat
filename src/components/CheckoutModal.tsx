import React, { useState } from 'react';
import { X, MessageCircle, AlertCircle, ShoppingBag } from 'lucide-react';
import { CartItem, OrderDetails } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  deliveryCharge: number;
  whatsappNumber: string;
  onSuccessOrder: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  deliveryCharge,
  whatsappNumber,
  onSuccessOrder,
}) => {
  const [formData, setFormData] = useState<OrderDetails>({
    customerName: '',
    phoneNumber: '',
    deliveryAddress: '',
    note: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const total = subtotal + deliveryCharge;

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.customerName.trim()) {
      errs.customerName = 'আপনার নাম লিখুন';
    }
    if (!formData.phoneNumber.trim() || formData.phoneNumber.length < 10) {
      errs.phoneNumber = 'সঠিক ও সচল মোবাইল নম্বর লিখুন (কমপক্ষে ১০ ডিজিট)';
    }
    if (!formData.deliveryAddress.trim()) {
      errs.deliveryAddress = 'সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleWhatsAppCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Construct structured WhatsApp message
    let message = `*📚 তিতাস লাইব্রেরি - নতুন অর্ডার*\n`;
    message += `--------------------------------------\n`;
    message += `*গ্রাহকের নাম:* ${formData.customerName.trim()}\n`;
    message += `*মোবাইল নম্বর:* ${formData.phoneNumber.trim()}\n`;
    message += `*ডেলিভারি ঠিকানা:* ${formData.deliveryAddress.trim()}\n`;
    if (formData.note?.trim()) {
      message += `*বিশেষ নোট:* ${formData.note.trim()}\n`;
    }
    message += `--------------------------------------\n`;
    message += `*অর্ডারের বিবরণ:*\n`;

    cartItems.forEach((item, idx) => {
      message += `${idx + 1}. ${item.product.title} (x${item.quantity}) - ৳${
        item.product.price * item.quantity
      } (একক: ৳${item.product.price})\n`;
    });

    message += `--------------------------------------\n`;
    message += `*সাবটোটাল:* ৳${subtotal}\n`;
    message += `*ডেলিভারি চার্জ:* ৳${deliveryCharge}\n`;
    message += `*সর্বমোট প্রদেয়:* ৳${total}\n`;
    message += `--------------------------------------\n`;
    message += `দয়া করে অর্ডারটি কনফার্ম করুন ও ডেলিভারির আপডেট জানান। ধন্যবাদ!`;

    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp in new tab
    window.open(url, '_blank');

    onSuccessOrder();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-pink-100 flex items-center justify-between bg-pink-50/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-pink-600" />
            <h3 className="text-lg font-bold text-[#2a0c24]">
              অর্ডার ও ডেলিভারি তথ্য
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

        {/* Body */}
        <form onSubmit={handleWhatsAppCheckout} className="p-5 sm:p-6 space-y-4">
          {/* Order Summary Snapshot */}
          <div className="bg-pink-50/40 rounded-2xl p-3.5 border border-pink-100 text-xs sm:text-sm space-y-1.5">
            <div className="font-semibold text-pink-800 mb-1">
              পণ্যের তালিকা ({cartItems.length} টি আইটেম):
            </div>
            {cartItems.map((item) => (
              <div
                key={item.product.id}
                className="flex justify-between text-gray-700"
              >
                <span className="truncate pr-2">
                  {item.product.title} <span className="text-pink-600">x{item.quantity}</span>
                </span>
                <span className="font-medium text-gray-800 flex-shrink-0">
                  ৳{item.product.price * item.quantity}
                </span>
              </div>
            ))}
            <div className="pt-2 border-t border-pink-100/80 flex justify-between font-bold text-sm text-[#2a0c24]">
              <span>মোট প্রদেয় (ডেলিভারিসহ):</span>
              <span className="text-[#ec4899]">৳{total}</span>
            </div>
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              আপনার পূর্ণ নাম *
            </label>
            <input
              type="text"
              required
              placeholder="উদাঃ মোঃ আনিসুর রহমান"
              value={formData.customerName}
              onChange={(e) =>
                setFormData({ ...formData, customerName: e.target.value })
              }
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
            />
            {errors.customerName && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.customerName}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              সচল মোবাইল নম্বর *
            </label>
            <input
              type="tel"
              required
              placeholder="উদাঃ 017XXXXXXXX"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
            />
            {errors.phoneNumber && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.phoneNumber}
              </p>
            )}
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              পূর্ণ ডেলিভারি ঠিকানা *
            </label>
            <textarea
              required
              rows={2}
              placeholder="বাড়ি/রোড নং, থানা/উপজেলা, জেলা"
              value={formData.deliveryAddress}
              onChange={(e) =>
                setFormData({ ...formData, deliveryAddress: e.target.value })
              }
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
            />
            {errors.deliveryAddress && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.deliveryAddress}
              </p>
            )}
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              বিশেষ কোনো নির্দেশনা (ঐচ্ছিক)
            </label>
            <input
              type="text"
              placeholder="যেমন: দ্রুত ডেলিভারি প্রয়োজন বা নির্দিষ্ট সময়"
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            <span>হোয়াটসঅ্যাপে অর্ডার পাঠিয়ে দিন</span>
          </button>

          <p className="text-center text-[11px] text-gray-500">
            বাটনটিতে চাপ দিলে স্বয়ংক্রিয়ভাবে একটি গোছানো মেসেজ নিয়ে আপনার হোয়াটসঅ্যাপ অ্যাপ বা ওয়েব চালু হবে।
          </p>
        </form>
      </div>
    </div>
  );
};
