import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, BookOpen, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ShopSectionProps {
  products: Product[];
  selectedCategory: string;
  whatsappNumber: string;
  loading: boolean;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ShopSection: React.FC<ShopSectionProps> = ({
  products,
  selectedCategory,
  whatsappNumber,
  loading,
  onViewDetails,
  onAddToCart,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'newest' | 'featured'>('default');

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory = selectedCategory
          ? p.category.toLowerCase() === selectedCategory.toLowerCase()
          : true;
        const matchesSearch = searchQuery
          ? p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
          : true;
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
        if (sortBy === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        return 0;
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <section id="shop" className="max-w-6xl mx-auto px-4 py-10">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2a0c24] tracking-tight">
            বই ও স্টেশনারি সম্ভার
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            তিতাস লাইব্রেরির আসল ও মানসম্মত বইসমূহ সংগ্রহ করুন
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="পণ্য বা বই খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-full bg-white/90 border border-pink-200/80 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                মুছুন
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex items-center">
            <SlidersHorizontal className="w-3.5 h-3.5 text-pink-600 absolute left-3.5 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="pl-9 pr-8 py-2 text-xs sm:text-sm rounded-full bg-white/90 border border-pink-200/80 focus:outline-none focus:border-pink-500 text-gray-700 cursor-pointer appearance-none transition-all"
            >
              <option value="default">সাধারণ সাজানো</option>
              <option value="price-asc">দাম: কম থেকে বেশি</option>
              <option value="price-desc">দাম: বেশি থেকে কম</option>
              <option value="newest">নতুন সংযোজন</option>
              <option value="featured">জনপ্রিয় / ফিচার্ড</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white/50 rounded-2xl p-4 border border-pink-100 animate-pulse space-y-3"
            >
              <div className="aspect-square bg-pink-100/60 rounded-xl" />
              <div className="h-4 bg-pink-100/60 rounded w-3/4" />
              <div className="h-4 bg-pink-100/60 rounded w-1/2" />
              <div className="h-8 bg-pink-100/60 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State when no real products in Firestore */}
      {!loading && products.length === 0 && (
        <div className="text-center py-16 px-4 rounded-3xl bg-white/60 border border-pink-100 shadow-xs max-w-md mx-auto my-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-pink-100 flex items-center justify-center text-pink-600 mb-4">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[#2a0c24] mb-2">
            কোনো পণ্য পাওয়া যায়নি
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            লাইব্রেরির ডাটাবেসে বর্তমানে কোনো বই বা পণ্য যুক্ত নেই। অ্যাডমিন প্যানেল থেকে পণ্য যোগ করলে তা এখানে সরাসরি প্রদর্শন হবে।
          </p>
        </div>
      )}

      {/* Empty State when filter/search yields 0 results */}
      {!loading && products.length > 0 && filteredProducts.length === 0 && (
        <div className="text-center py-12 px-4 rounded-2xl bg-white/60 border border-pink-100 max-w-md mx-auto">
          <AlertCircle className="w-8 h-8 mx-auto text-pink-400 mb-2" />
          <p className="text-sm font-semibold text-gray-700">
            অনুসন্ধানের সাথে কোনো পণ্য মেলেনি
          </p>
          <p className="text-xs text-gray-500 mt-1">
            অন্য কোনো কী-ওয়ার্ড দিয়ে সার্চ করুন বা সব ক্যাটাগরি ফিল্টার নির্বাচন করুন।
          </p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && filteredProducts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              whatsappNumber={whatsappNumber}
              onViewDetails={onViewDetails}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </section>
  );
};
