export type UserRole = "student" | "seller" | "admin";

export interface Dorm {
  id: number;
  name: string;
  code: string;
  address?: string;
}

export interface User {
  id: number;
  email: string;
  dorm_id: number;
  role: UserRole;
  date_joined?: string;
  phone?: string;
  room_number?: string;
  block?: string;
  seller_store_is_open?: boolean | null;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export interface ProductImage {
  id: number;
  image: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  is_active: boolean;
  is_out_of_stock: boolean;
  stock_quantity: number;
  category_id: number;
  category_name?: string;
  seller_id?: number;
  seller_store_is_open?: boolean;
  seller_phone?: string;
  seller_room?: string;
  images?: ProductImage[];
  image_url?: string | null;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: number;
  status: string;
  total_amount: number;
  notes?: string;
  created_at: string;
  seller_id: number;
  customer_id: number;
  items: OrderItem[];
  payment_method?: string;
  payment_method_display?: string;
  delivery_type?: string;
  delivery_type_display?: string;
  delivery_address?: string;
  delivery_phone?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_room?: string;
  seller_email?: string;
  seller_phone?: string;
  seller_room?: string;
}

export interface SubscriptionStatus {
  has_active: boolean;
  expires_at: string | null;
  plan: number | null;
  product_slots: number;
}

