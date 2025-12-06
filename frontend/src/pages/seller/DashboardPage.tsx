import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSellerDashboard } from "../../services/analytics";
import { Spinner } from "../../components/ui/Spinner";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  AreaChart,
  CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from "lucide-react";

const MetricCard = ({
  title,
  value,
  change,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
}) => {
  const isPositive = change >= 0;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="rounded-full bg-slate-100 p-3">
          <Icon className="h-6 w-6 text-slate-600" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        {isPositive ? (
          <TrendingUp className="h-4 w-4 text-green-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500" />
        )}
        <span className={`text-sm font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
          {isPositive ? "+" : ""}
          {change}%
        </span>
      </div>
    </div>
  );
};

export const DashboardPage = () => {
  const [dateRange, setDateRange] = useState<"7" | "30" | "365">("30");

  const { data, isLoading } = useQuery({
    queryKey: ["seller-dashboard", dateRange],
    queryFn: () => fetchSellerDashboard(dateRange),
  });

  if (isLoading) {
    return <Spinner label="Analitik veriler yükleniyor..." />;
  }

  if (!data) {
    return <div className="text-center text-slate-500">Veri bulunamadı.</div>;
  }

  const { stats, revenue_over_time, top_products } = data;

  const formatCurrency = (amount: number) => {
    return `₺${amount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getRangeLabel = (range: string) => {
    if (range === "7") return "Last 7 Days";
    if (range === "365") return "This Year";
    return "Last 30 Days";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Satış Analitiği</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setDateRange("7")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              dateRange === "7"
                ? "bg-brand-500 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Son 7 Gün
          </button>
          <button
            onClick={() => setDateRange("30")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              dateRange === "30"
                ? "bg-brand-500 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Son 30 Gün
          </button>
          <button
            onClick={() => setDateRange("365")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              dateRange === "365"
                ? "bg-brand-500 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Bu Yıl
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Toplam Gelir"
          value={formatCurrency(stats.total_revenue)}
          change={stats.revenue_change}
          icon={DollarSign}
        />
        <MetricCard
          title="Toplam Sipariş"
          value={stats.total_orders.toString()}
          change={stats.orders_change}
          icon={ShoppingCart}
        />
        <MetricCard
          title="Ortalama Sipariş Değeri"
          value={formatCurrency(stats.average_order_value)}
          change={stats.avg_order_change}
          icon={Package}
        />
        <MetricCard
          title="Yeni Müşteri"
          value={stats.new_customers.toString()}
          change={stats.customers_change}
          icon={Users}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Over Time */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Gelir Zaman Serisi</h2>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.total_revenue)}</p>
              <span className="text-sm font-semibold text-green-600">
                +{stats.revenue_change}%
              </span>
            </div>
            <p className="text-sm text-slate-500">{getRangeLabel(dateRange)}</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue_over_time}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">En Çok Satılan Ürünler</h2>
          <div className="space-y-4">
            {top_products.length > 0 ? (
              top_products.map((product) => (
                <div key={product.product_id} className="flex items-center gap-4">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                        Resim Yok
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-500">{product.units_sold} units sold</p>
                  </div>
                  <p className="font-bold text-slate-900">{formatCurrency(product.total_revenue)}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500">Henüz satış yok</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

