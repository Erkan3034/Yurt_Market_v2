import { useQuery } from "@tanstack/react-query";
import { fetchMyOrders } from "../../services/orders";
import dayjs from "dayjs";
import { Spinner } from "../../components/ui/Spinner";

export const OrdersPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["orders", "customer"],
    queryFn: () => fetchMyOrders("customer"),
  });

  if (isLoading) return <Spinner label="Siparişlerin yükleniyor..." />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Siparişlerin</h1>
        <p className="text-sm text-slate-500">Son siparişlerin ve durum güncellemeleri.</p>
      </div>
      <div className="space-y-4">
        {data?.map((order) => (
          <div key={order.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-slate-900">#{order.id}</p>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {order.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {dayjs(order.created_at).format("DD MMM YYYY HH:mm")}
            </p>
            <ul className="mt-3 text-sm text-slate-600">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>
                    {item.product_name} <span className="text-slate-400">x{item.quantity}</span>
                  </span>
                  <span>{item.unit_price * item.quantity} ₺</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between text-sm font-semibold text-slate-900">
              <span>Toplam</span>
              <span>{order.total_amount} ₺</span>
            </div>
          </div>
        ))}
        {!data?.length && <p className="text-sm text-slate-500">Henüz siparişin yok.</p>}
      </div>
    </div>
  );
};

