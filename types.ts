
export type ProductType = 'ACCOUNT' | 'STYLE' | 'SWORD';
export type PaymentMethod = 'ROBLOX';
export type OrderStatus = 'NEW' | 'PENDING_PAYMENT' | 'PENDING_DELIVERY' | 'DELIVERED';

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  type: ProductType;
  level?: number;
  fruits?: string[];
  rareItems?: string[];
  paymentMethods: PaymentMethod[];
  inStock: boolean;
  stockQuantity: number;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  password?: string;
  role: 'USER' | 'ADMIN';
  isBanned: boolean;
  createdAt: string;
  cart_data?: Product[];     // For Supabase persistence
  wishlist_data?: string[];  // For Supabase persistence
}

export interface Order {
  id: string;
  userId?: string; // Optional for guest checkout
  userName: string;
  userEmail?: string;
  productId: string;
  productName: string;
  productPrice: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  proofImage?: string;
  robloxUsername?: string;
  country?: string;
  notes?: string;
  createdAt: string;
}

export interface SiteSettings {
  binanceWallet: string;
  binanceQR: string;
  robloxGamePassUrl: string;
  importantNote: string;
  welcomeMessage: string;
  serverStatus: 'ONLINE' | 'MAINTENANCE' | 'OFFLINE';
  emailjsServiceId: string;
  emailjsTemplateId: string;
  emailjsPublicKey: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
