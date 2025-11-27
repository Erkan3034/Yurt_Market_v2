import { api } from "../lib/api-client";
import { Dorm } from "../types";

export const fetchDorms = async () => {
  const { data } = await api.get<Dorm[] | { results: Dorm[] }>("/api/dorms/");
  if (Array.isArray(data)) {
    return data;
  }
  return data.results ?? [];
};

