import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LandingPage } from "./pages/landing/LandingPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ProtectedRoute } from "./components/routing/ProtectedRoute";
import { AuthBootstrapper } from "./components/routing/AuthBootstrapper";
import { CustomerLayout } from "./layouts/CustomerLayout";
import { SellerLayout } from "./layouts/SellerLayout";
import { ExplorePage } from "./pages/customer/ExplorePage";
import { OrdersPage } from "./pages/customer/OrdersPage";
import { SubscriptionPage } from "./pages/customer/SubscriptionPage";
import { ProductsPage } from "./pages/seller/ProductsPage";
import { SellerOrdersPage } from "./pages/seller/SellerOrdersPage";
import { AnalyticsPage } from "./pages/seller/AnalyticsPage";
import { DashboardPage } from "./pages/seller/DashboardPage";
import { AdminLayout } from "./layouts/AdminLayout";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminHomePage } from "./pages/admin/AdminHomePage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage";
import { AdminOrdersPage } from "./pages/admin/AdminOrdersPage";
import { AdminAnalyticsPage } from "./pages/admin/AdminAnalyticsPage";
import { AdminSettingsPage } from "./pages/admin/AdminSettingsPage";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <AuthBootstrapper />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />

          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="explore" element={<ExplorePage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route index element={<Navigate to="explore" replace />} />
          </Route>

          <Route
            path="/seller/*"
            element={
              <ProtectedRoute role="seller">
                <SellerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="orders" element={<SellerOrdersPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="subscription" element={<SubscriptionPage />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          <Route
            path="/app/admin/*"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route index element={<AdminHomePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
