import React, { useState, useEffect, useMemo } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth, isAdminUid, DEFAULT_SETTINGS } from './firebase';
import { Product, Category, StoreSettings, CartItem } from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CategoryFilter } from './components/CategoryFilter';
import { ShopSection } from './components/ShopSection';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminLogin } from './components/AdminLogin';
import { AdminPanel } from './components/AdminPanel';
import { BookOpen, Phone, MapPin, Shield, Heart } from 'lucide-react';

export const App: React.FC = () => {
  // --- Firestore Real-time States ---
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // --- Auth & Admin States ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // --- UI Navigation & Filter States ---
  const [activeSection, setActiveSection] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // --- Cart State (localStorage only) ---
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('titus_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('titus_cart_items', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [cartItems]);

  // --- Auth Listener ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      const isAdm = isAdminUid(user?.uid);
      setIsAdminLoggedIn(isAdm);
    });
    return () => unsubscribe();
  }, []);

  // --- Hash Route Listener for #/admin ---
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#/admin' || window.location.hash === '#admin') {
        if (isAdminLoggedIn) {
          setIsAdminPanelOpen(true);
        } else {
          setIsAdminLoginOpen(true);
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [isAdminLoggedIn]);

  // --- Real-time Firestore Listeners (onSnapshot) ---
  useEffect(() => {
    // 1. Products Listener
    const productsQuery = query(collection(db, 'products'));
    const unsubProducts = onSnapshot(
      productsQuery,
      (snapshot) => {
        const list: Product[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Product, 'id'>),
        }));
        setProducts(list);
        setLoadingProducts(false);
      },
      (error) => {
        console.error('Firestore products error:', error);
        setLoadingProducts(false);
      }
    );

    // 2. Categories Listener
    const categoriesQuery = query(collection(db, 'categories'));
    const unsubCategories = onSnapshot(
      categoriesQuery,
      (snapshot) => {
        const list: Category[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Category, 'id'>),
        }));
        setCategories(list);
        setLoadingCategories(false);
      },
      (error) => {
        console.error('Firestore categories error:', error);
        setLoadingCategories(false);
      }
    );

    // 3. Settings Listener
    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'store'),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Partial<StoreSettings>;
          setSettings({
            ...DEFAULT_SETTINGS,
            ...data,
            heroProductIds: {
              ...DEFAULT_SETTINGS.heroProductIds,
              ...(data.heroProductIds || {}),
            },
          });
        }
      },
      (error) => {
        console.error('Firestore settings error:', error);
      }
    );

    return () => {
      unsubProducts();
      unsubCategories();
      unsubSettings();
    };
  }, []);

  // Update dynamic page title from settings
  useEffect(() => {
    if (settings.websiteName) {
      document.title = settings.websiteName;
    }
  }, [settings.websiteName]);

  // --- Cart Actions ---
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // --- Map Hero Products from Slots ---
  const heroProducts = useMemo(() => {
    const slots = settings.heroProductIds || {};
    const findProduct = (id?: string) =>
      id ? products.find((p) => p.id === id) : undefined;

    return {
      left1: findProduct(slots.left1),
      left2: findProduct(slots.left2),
      right1: findProduct(slots.right1),
      right2: findProduct(slots.right2),
    };
  }, [settings.heroProductIds, products]);

  // --- Navigation Handler ---
  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleAdminTrigger = () => {
    if (isAdminLoggedIn) {
      setIsAdminPanelOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf2f8] selection:bg-pink-500 selection:text-white">
      {/* 1. Header / Transparent Glass Navbar with Subtle Cursor Tracking */}
      <Navbar
        settings={settings}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenAdmin={handleAdminTrigger}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* 2. Hero Section with Background Video Timeline Scrub & Dynamic Floating Products */}
      <HeroSection
        settings={settings}
        heroProducts={heroProducts}
        onProductClick={(prod) => setSelectedProduct(prod)}
        onExploreClick={() => handleNavigate('shop')}
      />

      {/* 3. Categories Section */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          handleNavigate('shop');
        }}
        loading={loadingCategories}
      />

      {/* 4. Main Shop Section */}
      <ShopSection
        products={products}
        selectedCategory={selectedCategory}
        whatsappNumber={settings.whatsappNumber}
        loading={loadingProducts}
        onViewDetails={(prod) => setSelectedProduct(prod)}
        onAddToCart={(prod) => handleAddToCart(prod, 1)}
      />

      {/* 5. Modern Footer */}
      <footer className="mt-auto border-t border-pink-200/80 bg-white/70 backdrop-blur-md py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.websiteName}
                className="w-10 h-10 rounded-full object-cover border border-pink-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            )}
            <div>
              <h4 className="font-bold text-base text-[#2a0c24]">
                {settings.websiteName}
              </h4>
              <p className="text-xs text-gray-500 max-w-sm">
                {settings.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-medium text-gray-600">
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-pink-600 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>{settings.whatsappNumber}</span>
            </a>

            <button
              onClick={handleAdminTrigger}
              className="flex items-center gap-1.5 text-gray-500 hover:text-pink-600 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-pink-500" />
              <span>অ্যাডমিন পোর্টাল</span>
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-8 pt-4 border-t border-pink-100/80 text-center text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} {settings.websiteName}. সর্বস্বত্ব সংরক্ষিত।
          </span>
          <span className="flex items-center gap-1 text-[11px] text-pink-600/80">
            <span>Powered by Real-time Firestore</span>
          </span>
        </div>
      </footer>

      {/* --- Modals & Drawers --- */}

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        whatsappNumber={settings.whatsappNumber}
        onAddToCart={(prod, qty) => handleAddToCart(prod, qty)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        deliveryCharge={settings.deliveryCharge || 60}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        deliveryCharge={settings.deliveryCharge || 60}
        whatsappNumber={settings.whatsappNumber}
        onSuccessOrder={() => {
          handleClearCart();
        }}
      />

      {/* Admin Login Modal */}
      <AdminLogin
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminLoggedIn(true);
          setIsAdminPanelOpen(true);
        }}
      />

      {/* Admin Panel (Full Screen) */}
      {isAdminPanelOpen && (
        <AdminPanel
          products={products}
          categories={categories}
          settings={settings}
          onClose={() => {
            setIsAdminPanelOpen(false);
            if (window.location.hash.includes('admin')) {
              window.history.replaceState(null, '', window.location.pathname);
            }
          }}
        />
      )}
    </div>
  );
};

export default App;
