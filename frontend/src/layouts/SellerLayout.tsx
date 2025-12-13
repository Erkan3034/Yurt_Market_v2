import { useState } from "react";
import { Outlet } from "react-router-dom";
import { DashboardShell } from "../components/layout/DashboardShell";
import { Package, ClipboardCheck, BarChart3, CreditCard, LayoutDashboard } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleStoreStatus } from "../services/users";
import { toast } from "react-hot-toast";
import { authStore } from "../store/auth";

const menu = [
  { label: "Panel", to: "/seller/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Ürünlerim", to: "/seller/products", icon: <Package className="h-4 w-4" /> },
  { label: "Siparişler", to: "/seller/orders", icon: <ClipboardCheck className="h-4 w-4" /> },
  { label: "Analitik", to: "/seller/analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { label: "Abonelik", to: "/seller/subscription", icon: <CreditCard className="h-4 w-4" /> },
];

export const SellerLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const queryClient = useQueryClient();
  const user = authStore((state) => state.user);
  const storeIsOpen = user?.seller_store_is_open ?? true;

  const toggleMutation = useMutation({
    mutationFn: toggleStoreStatus,
    onSuccess: async (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      const { fetchCurrentUser } = await import("../services/auth");
      await fetchCurrentUser();
    },
    onError: () => toast.error("Mağaza durumu güncellenemedi"),
  });

  return (
    <DashboardShell 
      sidebar={menu} 
      isOpen={isSidebarOpen} 
      onOpen={() => setIsSidebarOpen(true)} // BURASI YENİ EKLENDİ
      onClose={() => setIsSidebarOpen(false)}
    >
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${storeIsOpen ? "bg-green-500" : "bg-red-500"}`} />
          <span className="text-sm font-semibold text-slate-700">
            Mağaza: {storeIsOpen ? "Açık" : "Kapalı"}
          </span>
        </div>
        <button
          onClick={() => toggleMutation.mutate()}
          disabled={toggleMutation.isPending}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            storeIsOpen
              ? "bg-red-50 text-red-600 hover:bg-red-100"
              : "bg-green-50 text-green-600 hover:bg-green-100"
          } disabled:opacity-50`}
        >
          {toggleMutation.isPending ? "Güncelleniyor..." : storeIsOpen ? "Mağazayı Kapat" : "Mağazayı Aç"}
        </button>
      </div>
      
      <Outlet />
    </DashboardShell>
  );
};