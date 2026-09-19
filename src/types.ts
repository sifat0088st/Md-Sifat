export interface Product {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  oldPrice?: number;
  category: string;
  description: string;
  available: boolean;
  featured: boolean;
  newArrival?: boolean;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  imageUrl?: string;
  createdAt: number;
}

export interface HeroProductSlots {
  left1?: string;
  left2?: string;
  right1?: string;
  right2?: string;
}

export interface StoreSettings {
  websiteName: string;
  description: string;
  tagline?: string;
  whatsappNumber: string;
  deliveryCharge?: number;
  logoUrl?: string;
  faviconUrl?: string;
  heroVideoUrl: string;
  heroMediaType?: 'video' | 'image';
  heroProductIds: HeroProductSlots;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderDetails {
  customerName: string;
  phoneNumber: string;
  deliveryAddress: string;
  note?: string;
}
