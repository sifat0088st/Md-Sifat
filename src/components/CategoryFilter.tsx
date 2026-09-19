import React from 'react';
import { Layers, Bookmark } from 'lucide-react';
import { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
  loading: boolean;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  loading,
}) => {
  if (loading) {
    return (
      <div className="flex gap-2.5 overflow-x-auto pb-2 justify-center">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-10 w-28 bg-pink-100/60 rounded-full animate-pulse flex-shrink-0"
          />
        ))}
      </div>
    );
  }

  return (
    <section id="categories" className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-pink-600" />
          <h3 className="text-lg sm:text-xl font-bold text-[#2a0c24]">
            ক্যাটাগরিসমূহ
          </h3>
        </div>
        {categories.length > 0 && (
          <span className="text-xs text-pink-700 font-medium bg-pink-100/60 px-2.5 py-1 rounded-full">
            মোট {categories.length} টি ক্যাটাগরি
          </span>
        )}
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-6 px-4 rounded-2xl bg-white/60 border border-pink-100">
          <Bookmark className="w-8 h-8 mx-auto text-pink-300 mb-2" />
          <p className="text-gray-500 text-sm font-medium">
            বর্তমানে কোনো ক্যাটাগরি পাওয়া যায়নি
          </p>
          <p className="text-xs text-gray-400 mt-1">
            অ্যাডমিন প্যানেল থেকে নতুন ক্যাটাগরি যোগ করা হলে তা এখানে দেখাবে।
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
          {/* All category pill */}
          <button
            onClick={() => onSelectCategory('')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
              selectedCategory === ''
                ? 'bg-gradient-to-r from-[#ec4899] to-[#f43f5e] text-white shadow-sm scale-105'
                : 'bg-white/80 text-gray-700 border border-pink-200/70 hover:border-pink-400 hover:text-pink-600'
            }`}
          >
            সব ক্যাটাগরি
          </button>

          {/* Dynamic Firestore categories */}
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#ec4899] to-[#f43f5e] text-white shadow-sm scale-105'
                    : 'bg-white/80 text-gray-700 border border-pink-200/70 hover:border-pink-400 hover:text-pink-600'
                }`}
              >
                {cat.imageUrl && (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-4 h-4 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
