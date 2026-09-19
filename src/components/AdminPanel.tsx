import React, { useState } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase';
import { Product, Category, StoreSettings, HeroProductSlots } from '../types';
import {
  Package,
  Layers,
  Sparkles,
  Settings,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ExternalLink,
  Save,
  AlertCircle,
} from 'lucide-react';

interface AdminPanelProps {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  categories,
  settings,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'hero' | 'settings'>('products');
  const [notification, setNotification] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // --- Product Form State ---
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [productFormData, setProductFormData] = useState<{
    title: string;
    category: string;
    price: number | '';
    oldPrice: number | '';
    description: string;
    imageUrl: string;
    available: boolean;
    featured: boolean;
    newArrival: boolean;
  }>({
    title: '',
    category: '',
    price: '',
    oldPrice: '',
    description: '',
    imageUrl: '',
    available: true,
    featured: false,
    newArrival: false,
  });

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductFormData({
      title: '',
      category: categories.length > 0 ? categories[0].name : '',
      price: '',
      oldPrice: '',
      description: '',
      imageUrl: '',
      available: true,
      featured: false,
      newArrival: true,
    });
    setIsProductFormOpen(true);
  };

  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductFormData({
      title: prod.title,
      category: prod.category,
      price: prod.price,
      oldPrice: prod.oldPrice ?? '',
      description: prod.description,
      imageUrl: prod.imageUrl,
      available: prod.available,
      featured: prod.featured,
      newArrival: prod.newArrival ?? false,
    });
    setIsProductFormOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productFormData.title.trim() || productFormData.price === '') {
      alert('দয়া করে পণ্যের নাম ও দাম লিখুন');
      return;
    }

    try {
      const payload: any = {
        title: productFormData.title.trim(),
        category: productFormData.category.trim() || 'সাধারণ',
        price: Number(productFormData.price),
        description: productFormData.description.trim(),
        imageUrl: productFormData.imageUrl.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
        available: Boolean(productFormData.available),
        featured: Boolean(productFormData.featured),
        newArrival: Boolean(productFormData.newArrival),
      };

      if (productFormData.oldPrice !== '') {
        payload.oldPrice = Number(productFormData.oldPrice);
      } else {
        payload.oldPrice = null;
      }

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), payload);
        showNotice('পণ্য সফলভাবে আপডেট করা হয়েছে!');
      } else {
        payload.createdAt = Date.now();
        await addDoc(collection(db, 'products'), payload);
        showNotice('নতুন পণ্য সফলভাবে যোগ করা হয়েছে!');
      }

      setIsProductFormOpen(false);
    } catch (err: any) {
      console.error('Error saving product:', err);
      alert('পণ্য সংরক্ষণ করতে সমস্যা হয়েছে: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (confirm(`আপনি কি নিশ্চিতভাবে "${title}" পণ্যটি মুছে ফেলতে চান?`)) {
      try {
        await deleteDoc(doc(db, 'products', id));
        showNotice('পণ্যটি মুছে ফেলা হয়েছে');
      } catch (err: any) {
        console.error('Error deleting product:', err);
        alert('পণ্য মুছে ফেলা যায়নি: ' + err.message);
      }
    }
  };

  const handleToggleProductField = async (
    id: string,
    field: 'available' | 'featured' | 'newArrival',
    currentVal: boolean
  ) => {
    try {
      await updateDoc(doc(db, 'products', id), {
        [field]: !currentVal,
      });
      showNotice('স্ট্যাটাস পরিবর্তিত হয়েছে');
    } catch (err: any) {
      console.error('Toggle error:', err);
    }
  };

  // --- Category Form State ---
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    imageUrl: '',
  });

  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({ name: '', imageUrl: '' });
    setIsCategoryFormOpen(true);
  };

  const openEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryFormData({ name: cat.name, imageUrl: cat.imageUrl || '' });
    setIsCategoryFormOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) {
      alert('ক্যাটাগরির নাম লিখুন');
      return;
    }

    try {
      const payload: any = {
        name: categoryFormData.name.trim(),
        imageUrl: categoryFormData.imageUrl.trim() || null,
      };

      if (editingCategory) {
        await updateDoc(doc(db, 'categories', editingCategory.id), payload);
        showNotice('ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে!');
      } else {
        payload.createdAt = Date.now();
        await addDoc(collection(db, 'categories'), payload);
        showNotice('নতুন ক্যাটাগরি যোগ করা হয়েছে!');
      }

      setIsCategoryFormOpen(false);
    } catch (err: any) {
      console.error('Error saving category:', err);
      alert('ক্যাটাগরি সংরক্ষণে সমস্যা: ' + err.message);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`আপনি কি "${name}" ক্যাটাগরিটি মুছে ফেলতে চান?`)) {
      try {
        await deleteDoc(doc(db, 'categories', id));
        showNotice('ক্যাটাগরি মুছে ফেলা হয়েছে');
      } catch (err: any) {
        console.error('Error deleting category:', err);
      }
    }
  };

  // --- Hero Slots Management ---
  const [heroSlots, setHeroSlots] = useState<HeroProductSlots>(
    settings.heroProductIds || {}
  );

  const handleSaveHeroSlots = async () => {
    try {
      await setDoc(
        doc(db, 'settings', 'store'),
        {
          heroProductIds: heroSlots,
        },
        { merge: true }
      );
      showNotice('হিরো স্লটের পণ্যসমূহ সফলভাবে হালনাগাদ করা হয়েছে!');
    } catch (err: any) {
      console.error('Hero slot save error:', err);
      alert('হিরো স্লট সংরক্ষণ ব্যর্থ হয়েছে: ' + err.message);
    }
  };

  // --- Store Settings State ---
  const [storeSettingsForm, setStoreSettingsForm] = useState<StoreSettings>({
    ...settings,
  });

  const handleSaveStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(
        doc(db, 'settings', 'store'),
        {
          websiteName: storeSettingsForm.websiteName.trim(),
          description: storeSettingsForm.description.trim(),
          tagline: storeSettingsForm.tagline?.trim() || '',
          whatsappNumber: storeSettingsForm.whatsappNumber.trim(),
          deliveryCharge: Number(storeSettingsForm.deliveryCharge || 0),
          logoUrl: storeSettingsForm.logoUrl?.trim() || '',
          faviconUrl: storeSettingsForm.faviconUrl?.trim() || '',
          heroVideoUrl: storeSettingsForm.heroVideoUrl.trim(),
          heroMediaType: storeSettingsForm.heroMediaType || 'video',
        },
        { merge: true }
      );
      showNotice('স্টোর সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
    } catch (err: any) {
      console.error('Settings save error:', err);
      alert('সেটিংস সংরক্ষণ করা যায়নি: ' + err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#fdf2f8] overflow-hidden">
      {/* Top Admin Header */}
      <div className="bg-white border-b border-pink-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-pink-600 text-white flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#2a0c24]">
              তিতাস লাইব্রেরি অ্যাডমিন কন্ট্রোল
            </h1>
            <p className="text-[11px] text-pink-600 font-medium">
              রিয়েলটাইম ফায়ারবেস স্টোর ম্যানেজমেন্ট
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-pink-200 text-xs font-semibold text-gray-700 hover:bg-pink-50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">সাইট দেখুন</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-xs font-semibold hover:bg-rose-100 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>লগআউট</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="bg-emerald-600 text-white text-xs sm:text-sm font-semibold px-4 py-2 text-center shadow-md animate-fadeIn flex items-center justify-center gap-2">
          <Check className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white/80 backdrop-blur-md border-b border-pink-100 px-4 sm:px-8 flex gap-2 sm:gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex-shrink-0 ${
            activeTab === 'products'
              ? 'border-pink-600 text-pink-600'
              : 'border-transparent text-gray-600 hover:text-pink-600'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>পণ্যসমূহ ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex-shrink-0 ${
            activeTab === 'categories'
              ? 'border-pink-600 text-pink-600'
              : 'border-transparent text-gray-600 hover:text-pink-600'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>ক্যাটাগরি ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex-shrink-0 ${
            activeTab === 'hero'
              ? 'border-pink-600 text-pink-600'
              : 'border-transparent text-gray-600 hover:text-pink-600'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>হিরো স্লট পণ্যসমূহ</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex-shrink-0 ${
            activeTab === 'settings'
              ? 'border-pink-600 text-pink-600'
              : 'border-transparent text-gray-600 hover:text-pink-600'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>স্টোর ও মিডিয়া সেটিংস</span>
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-6xl w-full mx-auto">
        {/* ================= PRODUCTS TAB ================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#2a0c24]">
                  পণ্য ও বইয়ের তালিকা
                </h2>
                <p className="text-xs text-gray-500">
                  সরাসরি ফায়ারস্টোর ডাটাবেসে রিয়েলটাইম সেভ হবে
                </p>
              </div>

              <button
                onClick={openAddProduct}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600 text-white font-semibold text-xs sm:text-sm hover:bg-pink-700 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন পণ্য যোগ করুন</span>
              </button>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-pink-100 p-6">
                <Package className="w-12 h-12 text-pink-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-800">
                  এখনো কোনো পণ্য যোগ করা হয়নি
                </h3>
                <p className="text-xs text-gray-500 mt-1 mb-4">
                  "নতুন পণ্য যোগ করুন" বাটনে ক্লিক করে প্রথম বইটি যোগ করুন।
                </p>
                <button
                  onClick={openAddProduct}
                  className="px-4 py-2 rounded-xl bg-pink-600 text-white text-xs font-semibold"
                >
                  পণ্য যুক্ত করুন
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-pink-100 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-pink-50/70 border-b border-pink-100 text-pink-900 font-bold uppercase text-[11px]">
                      <tr>
                        <th className="p-3 sm:p-4">ছবি ও নাম</th>
                        <th className="p-3 sm:p-4">ক্যাটাগরি</th>
                        <th className="p-3 sm:p-4">মূল্য</th>
                        <th className="p-3 sm:p-4">ইন স্টক</th>
                        <th className="p-3 sm:p-4">ফিচার্ড</th>
                        <th className="p-3 sm:p-4 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-50">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-pink-50/30 transition-colors">
                          <td className="p-3 sm:p-4 flex items-center gap-3 min-w-[200px]">
                            <img
                              src={p.imageUrl}
                              alt={p.title}
                              className="w-10 h-10 rounded-lg object-cover bg-pink-50 border border-pink-100 flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80';
                              }}
                            />
                            <div>
                              <div className="font-semibold text-gray-900 line-clamp-1">
                                {p.title}
                              </div>
                              <div className="text-[11px] text-gray-400">
                                ID: {p.id.slice(0, 6)}...
                              </div>
                            </div>
                          </td>
                          <td className="p-3 sm:p-4 text-gray-600 font-medium">
                            {p.category}
                          </td>
                          <td className="p-3 sm:p-4 font-bold text-pink-600">
                            ৳{p.price}
                            {p.oldPrice && (
                              <span className="text-gray-400 font-normal line-through text-xs ml-1.5">
                                ৳{p.oldPrice}
                              </span>
                            )}
                          </td>
                          <td className="p-3 sm:p-4">
                            <button
                              onClick={() =>
                                handleToggleProductField(p.id, 'available', p.available)
                              }
                              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                                p.available
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {p.available ? 'হ্যাঁ' : 'স্টক শেষ'}
                            </button>
                          </td>
                          <td className="p-3 sm:p-4">
                            <button
                              onClick={() =>
                                handleToggleProductField(p.id, 'featured', p.featured)
                              }
                              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                                p.featured
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {p.featured ? 'ফিচার্ড' : 'সাধারণ'}
                            </button>
                          </td>
                          <td className="p-3 sm:p-4 text-right space-x-1">
                            <button
                              onClick={() => openEditProduct(p)}
                              title="সম্পাদনা"
                              className="p-1.5 rounded-lg text-pink-600 hover:bg-pink-100 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.title)}
                              title="মুছুন"
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= CATEGORIES TAB ================= */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#2a0c24]">
                  ক্যাটাগরি ব্যবস্থাপনা
                </h2>
                <p className="text-xs text-gray-500">
                  এখানে যোগ করা ক্যাটাগরিগুলো হোমপেজে ও ফিল্টারে সরাসরি দেখাবে
                </p>
              </div>

              <button
                onClick={openAddCategory}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600 text-white font-semibold text-xs sm:text-sm hover:bg-pink-700 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন ক্যাটাগরি</span>
              </button>
            </div>

            {categories.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-pink-100 p-6">
                <Layers className="w-12 h-12 text-pink-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-800">
                  কোনো ক্যাটাগরি নেই
                </h3>
                <p className="text-xs text-gray-500 mt-1 mb-4">
                  বই সাজানোর জন্য ক্যাটাগরি তৈরি করুন (যেমন: উপন্যাস, ইসলামিক, বিজ্ঞান, একাডেমিক)।
                </p>
                <button
                  onClick={openAddCategory}
                  className="px-4 py-2 rounded-xl bg-pink-600 text-white text-xs font-semibold"
                >
                  ক্যাটাগরি তৈরি করুন
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-4 rounded-2xl bg-white border border-pink-100 shadow-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {cat.imageUrl ? (
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="w-10 h-10 rounded-xl object-cover bg-pink-50 border border-pink-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                          <Layers className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">
                          {cat.name}
                        </h4>
                        <span className="text-[11px] text-gray-400">
                          {products.filter((p) => p.category === cat.name).length}{' '}
                          টি পণ্য
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditCategory(cat)}
                        className="p-1.5 rounded-lg text-pink-600 hover:bg-pink-100"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= HERO PRODUCT SLOTS TAB ================= */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#2a0c24]">
                হিরো সেকশনের চারটি ভাসমান পণ্য নির্বাচন
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                হোমপেজের হিরো ভিডিওর চারপাশে ভাসমান ৪টি পণ্যের স্লট (Left Top, Left Bottom, Right Top, Right Bottom) এখান থেকে সরাসরি ডায়নামিকালি নির্বাচন করুন।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-3xl border border-pink-100 shadow-xs">
              {/* Slot 1: Left Top */}
              <div className="space-y-2 p-4 rounded-2xl bg-pink-50/40 border border-pink-100">
                <label className="block text-xs font-bold text-pink-950 uppercase tracking-wide">
                  ১. বাম দিকের উপরের স্লট (Left Top - left1)
                </label>
                <select
                  value={heroSlots.left1 || ''}
                  onChange={(e) =>
                    setHeroSlots({ ...heroSlots, left1: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-pink-200 bg-white focus:outline-none focus:border-pink-500"
                >
                  <option value="">-- কোনো পণ্য নির্বাচন করা নেই (লুকায়িত থাকবে) --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (৳{p.price})
                    </option>
                  ))}
                </select>
              </div>

              {/* Slot 2: Left Bottom */}
              <div className="space-y-2 p-4 rounded-2xl bg-pink-50/40 border border-pink-100">
                <label className="block text-xs font-bold text-pink-950 uppercase tracking-wide">
                  ২. বাম দিকের নিচের স্লট (Left Bottom - left2)
                </label>
                <select
                  value={heroSlots.left2 || ''}
                  onChange={(e) =>
                    setHeroSlots({ ...heroSlots, left2: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-pink-200 bg-white focus:outline-none focus:border-pink-500"
                >
                  <option value="">-- কোনো পণ্য নির্বাচন করা নেই (লুকায়িত থাকবে) --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (৳{p.price})
                    </option>
                  ))}
                </select>
              </div>

              {/* Slot 3: Right Top */}
              <div className="space-y-2 p-4 rounded-2xl bg-pink-50/40 border border-pink-100">
                <label className="block text-xs font-bold text-pink-950 uppercase tracking-wide">
                  ৩. ডান দিকের উপরের স্লট (Right Top - right1)
                </label>
                <select
                  value={heroSlots.right1 || ''}
                  onChange={(e) =>
                    setHeroSlots({ ...heroSlots, right1: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-pink-200 bg-white focus:outline-none focus:border-pink-500"
                >
                  <option value="">-- কোনো পণ্য নির্বাচন করা নেই (লুকায়িত থাকবে) --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (৳{p.price})
                    </option>
                  ))}
                </select>
              </div>

              {/* Slot 4: Right Bottom */}
              <div className="space-y-2 p-4 rounded-2xl bg-pink-50/40 border border-pink-100">
                <label className="block text-xs font-bold text-pink-950 uppercase tracking-wide">
                  ৪. ডান দিকের নিচের স্লট (Right Bottom - right2)
                </label>
                <select
                  value={heroSlots.right2 || ''}
                  onChange={(e) =>
                    setHeroSlots({ ...heroSlots, right2: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-pink-200 bg-white focus:outline-none focus:border-pink-500"
                >
                  <option value="">-- কোনো পণ্য নির্বাচন করা নেই (লুকায়িত থাকবে) --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (৳{p.price})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSaveHeroSlots}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              <span>হিরো স্লট সেভ করুন</span>
            </button>
          </div>
        )}

        {/* ================= SETTINGS TAB ================= */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveStoreSettings} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#2a0c24]">
                স্টোর তথ্য ও মিডিয়া কনফিগারেশন
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Firestore 'settings/store' ডকুমেন্টে সেভ হবে এবং হোমপেজে রিয়েলটাইমে আপডেট হবে
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-pink-100 shadow-xs space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Website Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    ওয়েবসাইটের নাম
                  </label>
                  <input
                    type="text"
                    required
                    value={storeSettingsForm.websiteName}
                    onChange={(e) =>
                      setStoreSettingsForm({
                        ...storeSettingsForm,
                        websiteName: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500"
                  />
                </div>

                {/* Tagline */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    ট্যাগলাইন
                  </label>
                  <input
                    type="text"
                    value={storeSettingsForm.tagline || ''}
                    onChange={(e) =>
                      setStoreSettingsForm({
                        ...storeSettingsForm,
                        tagline: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500"
                  />
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    অ্যাডমিন হোয়াটসঅ্যাপ নম্বর
                  </label>
                  <input
                    type="text"
                    required
                    value={storeSettingsForm.whatsappNumber}
                    onChange={(e) =>
                      setStoreSettingsForm({
                        ...storeSettingsForm,
                        whatsappNumber: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500"
                  />
                </div>

                {/* Delivery Charge */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    ডেলিভারি চার্জ (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={storeSettingsForm.deliveryCharge}
                    onChange={(e) =>
                      setStoreSettingsForm({
                        ...storeSettingsForm,
                        deliveryCharge: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500"
                  />
                </div>

                {/* Logo URL */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    লোগো URL
                  </label>
                  <input
                    type="url"
                    value={storeSettingsForm.logoUrl || ''}
                    onChange={(e) =>
                      setStoreSettingsForm({
                        ...storeSettingsForm,
                        logoUrl: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500"
                  />
                </div>

                {/* Media Type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    হিরো মিডিয়া টাইপ
                  </label>
                  <select
                    value={storeSettingsForm.heroMediaType || 'video'}
                    onChange={(e) =>
                      setStoreSettingsForm({
                        ...storeSettingsForm,
                        heroMediaType: e.target.value as any,
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-pink-200 bg-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="video">ভিডিও (Video - Scrubbing Enabled)</option>
                    <option value="image">ছবি (Static Image)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  সংক্ষিপ্ত বর্ণনা
                </label>
                <textarea
                  rows={2}
                  value={storeSettingsForm.description}
                  onChange={(e) =>
                    setStoreSettingsForm({
                      ...storeSettingsForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Hero Video URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  হিরো ব্যাকগ্রাউন্ড ভিডিও / ইমেজ URL
                </label>
                <input
                  type="url"
                  required
                  value={storeSettingsForm.heroVideoUrl}
                  onChange={(e) =>
                    setStoreSettingsForm({
                      ...storeSettingsForm,
                      heroVideoUrl: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500"
                />
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm shadow-md transition-all"
              >
                <Save className="w-4 h-4" />
                <span>সেটিংস সেভ করুন</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ================= PRODUCT ADD/EDIT MODAL ================= */}
      {isProductFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-pink-100 flex items-center justify-between bg-pink-50/50">
              <h3 className="font-bold text-base text-[#2a0c24]">
                {editingProduct ? 'পণ্য সম্পাদনা করুন' : 'নতুন পণ্য যোগ করুন'}
              </h3>
              <button
                onClick={() => setIsProductFormOpen(false)}
                className="p-1 rounded-full text-gray-500 hover:bg-pink-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveProduct}
              className="p-5 overflow-y-auto space-y-3.5 text-xs sm:text-sm"
            >
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  পণ্যের শিরোনাম / বইয়ের নাম *
                </label>
                <input
                  type="text"
                  required
                  value={productFormData.title}
                  onChange={(e) =>
                    setProductFormData({ ...productFormData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    ক্যাটাগরি
                  </label>
                  <input
                    type="text"
                    list="cat-suggestions"
                    value={productFormData.category}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        category: e.target.value,
                      })
                    }
                    placeholder="যেমন: উপন্যাস"
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500"
                  />
                  <datalist id="cat-suggestions">
                    {categories.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    বর্তমান বিক্রয় মূল্য (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productFormData.price}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        price: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    পুরোনো মূল্য / গায়ের দাম (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="ঐচ্ছিক (ছাড় দেখানোর জন্য)"
                    value={productFormData.oldPrice}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        oldPrice: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    ছবি URL (External Web Link) *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={productFormData.imageUrl}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        imageUrl: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  পণ্যের বিস্তারিত বিবরণ
                </label>
                <textarea
                  rows={3}
                  value={productFormData.description}
                  onChange={(e) =>
                    setProductFormData({
                      ...productFormData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productFormData.available}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        available: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-pink-600 rounded"
                  />
                  <span>স্টক রয়েছে (Available)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productFormData.featured}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        featured: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-pink-600 rounded"
                  />
                  <span>ফিচার্ড পণ্য (Featured)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productFormData.newArrival}
                    onChange={(e) =>
                      setProductFormData({
                        ...productFormData,
                        newArrival: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-pink-600 rounded"
                  />
                  <span>নতুন সংযোজন (New Arrival)</span>
                </label>
              </div>

              <div className="pt-3 border-t border-pink-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CATEGORY ADD/EDIT MODAL ================= */}
      {isCategoryFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-pink-100 flex items-center justify-between bg-pink-50/50">
              <h3 className="font-bold text-sm text-[#2a0c24]">
                {editingCategory ? 'ক্যাটাগরি সম্পাদনা' : 'নতুন ক্যাটাগরি তৈরি'}
              </h3>
              <button
                onClick={() => setIsCategoryFormOpen(false)}
                className="p-1 rounded-full text-gray-500 hover:bg-pink-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-5 space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  ক্যাটাগরির নাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: উপন্যাস বা ইসলামিক"
                  value={categoryFormData.name}
                  onChange={(e) =>
                    setCategoryFormData({ ...categoryFormData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  আইকন বা ছবি URL (ঐচ্ছিক)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={categoryFormData.imageUrl}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      imageUrl: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="pt-3 border-t border-pink-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700"
                >
                  সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
