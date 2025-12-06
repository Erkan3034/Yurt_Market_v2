import { api } from "../lib/api-client";

export interface PopularSeller {
  seller_id: number;
  score: number;
  rank: number;
}

export interface SellerDashboardStats {
  total_revenue: number;
  revenue_change: number;
  total_orders: number;
  orders_change: number;
  average_order_value: number;
  avg_order_change: number;
  new_customers: number;
  customers_change: number;
}

export interface RevenueDataPoint {
  week: string;
  revenue: number;
}

export interface TopProduct {
  product_id: number;
  name: string;
  image: string | null;
  units_sold: number;
  total_revenue: number;
}

export interface SellerDashboardResponse {
  stats: SellerDashboardStats;
  revenue_over_time: RevenueDataPoint[];
  top_products: TopProduct[];
  date_range: number;
}

export const fetchPopularSellers = async (dormId: number) => {
  const { data } = await api.get<PopularSeller[]>(`/api/analytics/popular-sellers?dorm=${dormId}`);
  return data;
};

export const fetchSellerDashboard = async (range: "7" | "30" | "365" = "30") => {
  const { data } = await api.get<SellerDashboardResponse>(`/api/analytics/seller/dashboard?range=${range}`);
  return data;
};

