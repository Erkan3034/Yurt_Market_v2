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
}

export interface SubscriptionStatus {
  has_active: boolean;
  expires_at: string | null;
  plan: number | null;
  product_slots: number;
}

