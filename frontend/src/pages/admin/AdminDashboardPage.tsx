import { useQuery } from "@tanstack/react-query";
import { fetchAdminDashboard, fetchAdminRecentOrders } from "../../services/admin";
import { Spinner } from "../../components/ui/Spinner";
import { TrendingUp } from "lucide-react";

const MetricCard = ({
  title,
  value,
  change,
  changeLabel,
}: {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
}) => {
  const isPositive = change >= 0;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-600">{title}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      <div className="mt-4 flex items-center gap-2">
        <TrendingUp className={`h-4 w-4 ${isPositive ? "text-green-500" : "text-red-500"}`} />
        <span className={`text-sm font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
          {isPositive ? "+" : ""}
          {change}% {changeLabel}
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

export const AdminDashboardPage = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: fetchAdminDashboard,
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: () => fetchAdminRecentOrders(10),
  });

  if (statsLoading || ordersLoading) {
    return <Spinner label="Dashboard verileri yükleniyor..." />;
  }

  if (!stats) {
    return <div className="text-center text-slate-500">Veri bulunamadı.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(stats.total_revenue)}
          change={stats.revenue_change}
          changeLabel="vs last month"
        />
        <MetricCard
          title="Subscriptions"
          value={`+${stats.subscriptions}`}
          change={stats.subscriptions_change}
          changeLabel="vs last month"
        />
        <MetricCard
          title="Sales"
          value={`+${stats.sales}`}
          change={stats.sales_change}
          changeLabel="vs last month"
        />
        <MetricCard
          title="Active Now"
          value={stats.active_now.toString()}
          change={stats.active_now_change}
          changeLabel="since last hour"
        />
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-slate-900">Recent Orders</h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentOrders && recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{order.customer}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{order.type}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${order.status_class}`}
                      >
                        {order.status_label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{order.date}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {formatCurrency(order.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                    Henüz sipariş yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

