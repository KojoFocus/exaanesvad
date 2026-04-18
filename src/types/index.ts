// ─── Status / Enum Types ──────────────────────────────────
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'delivered' | 'cancelled';
export type AdminRole   = 'admin' | 'editor';

// ─── Core Entities ───────────────────────────────────────
export interface Category {
  id:   string;
  name: string;
  slug: string;
}

export interface ProductImage {
  url: string;
  alt: string;
}

export interface Product {
  id:               string;
  name:             string;
  slug:             string;
  description:      string;
  shortDescription: string;
  price:            number;
  stock:            number;
  category:         Category;
  images:           ProductImage[];
  featured:         boolean;
  published:        boolean;
  createdAt:        string;
  updatedAt:        string;
}

export interface OrderItem {
  id:          string;
  productId:   string;
  productName: string;
  quantity:    number;
  unitPrice:   number;
}

export interface Order {
  id:            string;
  customerName:  string;
  customerEmail: string;
  customerPhone: string;
  address:       string;
  items:         OrderItem[];
  totalAmount:   number;
  status:        OrderStatus;
  createdAt:     string;
}

export interface Activity {
  id:            string;
  title:         string;
  slug:          string;
  summary:       string;
  content:       string;
  featuredImage: string;
  gallery:       string[];
  videoUrl?:     string;
  activityDate:  string;
  location:      string;
  category:      string;
  published:     boolean;
  createdAt:     string;
}

export interface Announcement {
  id:        string;
  title:     string;
  slug:      string;
  content:   string;
  summary:   string;
  featured:  boolean;
  published: boolean;
  createdAt: string;
}

export interface GalleryItem {
  id:        string;
  image:     string;
  caption?:  string;
  category?: string;
  createdAt: string;
}

export interface Video {
  id:           string;
  title:        string;
  description?: string;
  thumbnail?:   string;
  videoUrl?:    string;
  embedUrl?:    string;
  category?:    string;
  published:    boolean;
  createdAt:    string;
}

export interface AdminUser {
  id:    string;
  name:  string;
  email: string;
  role:  AdminRole;
}

export interface SiteSettings {
  siteName:    string;
  tagline:     string;
  email:       string;
  phone:       string;
  address:     string;
  socialLinks: {
    facebook?:  string;
    instagram?: string;
    twitter?:   string;
    youtube?:   string;
  };
  footerText: string;
}

// ─── Cart ─────────────────────────────────────────────────
export interface CartItem {
  product:  Product;
  quantity: number;
}

// ─── API Response Wrappers ────────────────────────────────
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data:    T[];
  total:   number;
  page:    number;
  perPage: number;
}

// ─── Form Types ───────────────────────────────────────────
export interface ProductFormData {
  name:             string;
  description:      string;
  shortDescription: string;
  price:            number;
  stock:            number;
  categoryId:       string;
  featured:         boolean;
  published:        boolean;
  images:           ProductImage[];
}

export interface OrderFormData {
  customerName:  string;
  customerEmail: string;
  customerPhone: string;
  address:       string;
  items:         { productId: string; quantity: number }[];
}
