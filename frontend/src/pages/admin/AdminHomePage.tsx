import { useQuery } from "@tanstack/react-query";
import { fetchAdminDashboard } from "../../services/admin";
import { Spinner } from "../../components/ui/Spinner";
import { DollarSign, ShoppingCart, Users, CreditCard, TrendingUp } from "lucide-react";

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return `₺${(amount / 1000000).toFixed(1)}m`;
  }
  if (amount >= 1000) {
    return `₺${(amount / 1000).toFixed(1)}k`;
  }
  return `₺${amount.toFixed(2)}`;
};

export const AdminHomePage = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: fetchAdminDashboard,
  });

  if (isLoading) return <Spinner label="Veriler yükleniyor..." />;

  if (!stats) {
    return <div className="text-center text-slate-500">Veri bulunamadı.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Yurt Market Yönetim Paneli</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Toplam Gelir</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(stats.total_revenue)}</p>
            </div>
            <div className="rounded-full bg-slate-100 p-3">
              <DollarSign className="h-6 w-6 text-slate-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-semibold text-green-600">+{stats.revenue_change}%</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Abonelikler</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">+{stats.subscriptions}</p>
            </div>
            <div className="rounded-full bg-slate-100 p-3">
              <CreditCard className="h-6 w-6 text-slate-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-semibold text-green-600">+{stats.subscriptions_change}%</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Satışlar</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">+{stats.sales}</p>
            </div>
            <div className="rounded-full bg-slate-100 p-3">
              <ShoppingCart className="h-6 w-6 text-slate-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-semibold text-green-600">+{stats.sales_change}%</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Aktif Kullanıcılar</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{stats.active_now}</p>
            </div>
            <div className="rounded-full bg-slate-100 p-3">
              <Users className="h-6 w-6 text-slate-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-semibold text-green-600">+{stats.active_now_change}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Hızlı Erişim</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="/app/admin/users"
            className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center transition-colors hover:bg-slate-100"
          >
            <Users className="mx-auto h-8 w-8 text-slate-600" />
            <p className="mt-2 text-sm font-semibold text-slate-900">Kullanıcılar</p>
          </a>
          <a
            href="/app/admin/products"
            className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center transition-colors hover:bg-slate-100"
          >
            <ShoppingCart className="mx-auto h-8 w-8 text-slate-600" />
            <p className="mt-2 text-sm font-semibold text-slate-900">Ürünler</p>
          </a>
          <a
            href="/app/admin/orders"
            className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center transition-colors hover:bg-slate-100"
          >
            <CreditCard className="mx-auto h-8 w-8 text-slate-600" />
            <p className="mt-2 text-sm font-semibold text-slate-900">Siparişler</p>
          </a>
        </div>
      </div>
    </div>
  );
};

