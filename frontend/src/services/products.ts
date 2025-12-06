import { api } from "../lib/api-client";
import { Product } from "../types";

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export const fetchDormProducts = async (dormId?: number) => {
  const { data } = await api.get<Product[]>(`/api/products?dorm=${dormId ?? ""}`);
  return data;
};

export const fetchSellerProducts = async () => {
  const { data } = await api.get<Product[]>("/api/products/seller/products");
  return data;
};

export const fetchCategories = async () => {
  const { data } = await api.get<Category[]>("/api/products/categories");
  return data;
};

export const createProduct = async (payload: {
  name: string;
  description: string;
  price: number;
  category_id: number;
  stock_quantity: number;
}) => {
  const { data } = await api.post("/api/products/seller/products", {
    ...payload,
    dorm_id: undefined,
  });
  return data;
};

export const updateProduct = async (
  id: number,
  payload: Partial<{
    name: string;
    description: string;
    price: number;
    category_id: number;
    stock_quantity: number;
    is_active: boolean;
  }>,
) => {
  const { data } = await api.patch(`/api/products/seller/products/${id}`, payload);
  return data;
};

export const deleteProduct = async (id: number) => {
  await api.delete(`/api/products/seller/products/${id}`);
};

