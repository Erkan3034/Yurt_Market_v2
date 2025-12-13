import { Outlet } from "react-router-dom";
import { DashboardShell } from "../components/layout/DashboardShell";
import { ShoppingBag, Home, Package, List, Users, BarChart3, Settings } from "lucide-react";

const menu = [
  { label: "Panel", to: "/app/admin/dashboard", icon: <ShoppingBag className="h-4 w-4" /> },
  { label: "Ana Sayfa", to: "/app/admin", icon: <Home className="h-4 w-4" /> },
  { label: "Ürünler", to: "/app/admin/products", icon: <Package className="h-4 w-4" /> },
  { label: "Siparişler", to: "/app/admin/orders", icon: <List className="h-4 w-4" /> },
  { label: "Kullanıcılar", to: "/app/admin/users", icon: <Users className="h-4 w-4" /> },
  { label: "Analitik", to: "/app/admin/analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { label: "Ayarlar", to: "/app/admin/settings", icon: <Settings className="h-4 w-4" /> },
];

export const AdminLayout = () => {
  return (
    <DashboardShell sidebar={menu}>
      <Outlet />
    </DashboardShell>
  );
};

