import { api } from "../lib/api-client";
import { User, Product, Order } from "../types";

export interface AdminDashboardStats {
  total_revenue: number;
  revenue_change: number;
  revenue_last_month: number;
  subscriptions: number;
  subscriptions_change: number;
  subscriptions_last_month: number;
  sales: number;
  sales_change: number;
  sales_last_month: number;
  active_now: number;
  active_now_change: number;
}

export interface RecentOrder {
  id: number;
  customer: string;
  type: string;
  status: string;
  status_label: string;
  status_class: string;
  date: string;
  amount: number;
}

export const fetchAdminDashboard = async () => {
  const { data } = await api.get<AdminDashboardStats>("/api/admin/dashboard");
  return data;
};

export const fetchAdminRecentOrders = async (limit: number = 10) => {
  const { data } = await api.get<RecentOrder[]>(`/api/admin/recent-orders?limit=${limit}`);
  return data;
};

export const fetchAdminUsers = async () => {
  const { data } = await api.get<User[]>("/api/admin/users");
  return data;
};

export const fetchAdminProducts = async () => {
  const { data } = await api.get<Product[]>("/api/admin/products");
  return data;
};

export const fetchAdminOrders = async () => {
  const { data } = await api.get<Order[]>("/api/admin/orders");
  return data;
};

