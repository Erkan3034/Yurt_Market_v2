import { useQuery } from "@tanstack/react-query";
import { fetchAdminDashboard } from "../../services/admin";
import { Spinner } from "../../components/ui/Spinner";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar, AreaChart, Area, CartesianGrid } from "recharts";
import { TrendingUp, DollarSign, ShoppingCart, Users, CreditCard } from "lucide-react";

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
          <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
        )}
        <span className={`text-sm font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
          {isPositive ? "+" : ""}
          {change}%
        </span>
      </div>
    </div>
  );
};

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return `₺${(amount / 1000000).toFixed(1)}m`;
  }
  if (amount >= 1000) {
    return `₺${(amount / 1000).toFixed(1)}k`;
  }
  return `₺${amount.toFixed(2)}`;
};

export const AdminAnalyticsPage = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: fetchAdminDashboard,
  });

  if (isLoading) return <Spinner label="Analitik veriler yükleniyor..." />;

  if (!stats) {
    return <div className="text-center text-slate-500">Veri bulunamadı.</div>;
  }

  // Mock data for charts (you can replace with real data from API)
  const revenueData = [
    { month: "Ocak", revenue: stats.revenue_last_month * 0.8 },
    { month: "Şubat", revenue: stats.revenue_last_month * 0.9 },
    { month: "Mart", revenue: stats.revenue_last_month },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Analitik</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Toplam Gelir"
          value={formatCurrency(stats.total_revenue)}
          change={stats.revenue_change}
          icon={DollarSign}
        />
        <MetricCard
          title="Abonelikler"
          value={`+${stats.subscriptions}`}
          change={stats.subscriptions_change}
          icon={CreditCard}
        />
        <MetricCard
          title="Satışlar"
          value={`+${stats.sales}`}
          change={stats.sales_change}
          icon={ShoppingCart}
        />
        <MetricCard
          title="Aktif Kullanıcılar"
          value={stats.active_now.toString()}
          change={stats.active_now_change}
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Aylık Gelir Trendi</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
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

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Satış Dağılımı</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="revenue" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

