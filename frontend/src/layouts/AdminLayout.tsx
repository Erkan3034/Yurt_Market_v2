import { Outlet } from "react-router-dom";
import { DashboardShell } from "../components/layout/DashboardShell";
import { ShoppingBag, Home, Package, List, Users, BarChart3, Settings } from "lucide-react";

const menu = [
  { label: "Dashboard", to: "/app/admin/dashboard", icon: <ShoppingBag className="h-4 w-4" /> },
  { label: "Home", to: "/app/admin", icon: <Home className="h-4 w-4" /> },
  { label: "Products", to: "/app/admin/products", icon: <Package className="h-4 w-4" /> },
  { label: "Orders", to: "/app/admin/orders", icon: <List className="h-4 w-4" /> },
  { label: "Users", to: "/app/admin/users", icon: <Users className="h-4 w-4" /> },
  { label: "Analytics", to: "/app/admin/analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { label: "Settings", to: "/app/admin/settings", icon: <Settings className="h-4 w-4" /> },
];

export const AdminLayout = () => {
  return (
    <DashboardShell sidebar={menu}>
      <Outlet />
    </DashboardShell>
  );
};

