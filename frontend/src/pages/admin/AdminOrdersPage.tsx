import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminOrders } from "../../services/admin";
import { Spinner } from "../../components/ui/Spinner";
import { OrderDetailModal } from "../../components/orders/OrderDetailModal";
import { Order } from "../../types";
import dayjs from "dayjs";
import "dayjs/locale/tr";

dayjs.locale("tr");

const getStatusInfo = (status: string) => {
  switch (status) {
    case "PENDING":
      return { label: "Beklemede", className: "bg-blue-100 text-blue-700" };
    case "ONAY":
      return { label: "Hazırlanıyor", className: "bg-yellow-100 text-yellow-700" };
    case "COMPLETED":
      return { label: "Tamamlandı", className: "bg-green-100 text-green-700" };
    case "RED":
      return { label: "Reddedildi", className: "bg-red-100 text-red-700" };
    case "IPTAL":
      return { label: "İptal Edildi", className: "bg-slate-100 text-slate-700" };
    default:
      return { label: status, className: "bg-slate-100 text-slate-700" };
  }
};

export const AdminOrdersPage = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: fetchAdminOrders,
  });

  if (isLoading) return <Spinner label="Siparişler yükleniyor..." />;

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Siparişler</h1>
        <p className="text-sm text-slate-600">Toplam {orders?.length || 0} sipariş</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">Müşteri</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">Satıcı</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">Durum</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">Tarih</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">Tutar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders && orders.length > 0 ? (
              orders.map((order: Order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <tr
                    key={order.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => handleOrderClick(order)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">#{order.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {order.customer_email?.split("@")[0] || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {order.seller_email?.split("@")[0] || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {dayjs(order.created_at).format("DD.MM.YYYY")}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      ₺{Number(order.total_amount).toFixed(2)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                  Henüz sipariş yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrder(null);
        }}
      />
    </div>
  );
};

