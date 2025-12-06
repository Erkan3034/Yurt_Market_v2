import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyOrders, orderAction } from "../../services/orders";
import { toast } from "react-hot-toast";
import { Spinner } from "../../components/ui/Spinner";
import { OrderDetailModal } from "../../components/orders/OrderDetailModal";
import { Order } from "../../types";
import dayjs from "dayjs";
import { Search, X, Check } from "lucide-react";
import "dayjs/locale/tr";

dayjs.locale("tr");

type StatusFilter = "all" | "PENDING" | "ONAY" | "COMPLETED" | "cancelled";

const getStatusInfo = (status: string) => {
  switch (status) {
    case "ONAY":
      return { label: "Hazırlanıyor", className: "bg-yellow-100 text-yellow-700" };
    case "PENDING":
      return { label: "Yeni", className: "bg-blue-100 text-blue-700" };
    case "COMPLETED":
      return { label: "Tamamlandı", className: "bg-green-100 text-green-700" };
    case "IPTAL":
      return { label: "İptal Edildi", className: "bg-slate-100 text-slate-700" };
    case "RED":
      return { label: "Reddedildi", className: "bg-red-100 text-red-700" };
    default:
      return { label: status, className: "bg-slate-100 text-slate-700" };
  }
};

export const SellerOrdersPage = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("PENDING");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["orders", "seller"],
    queryFn: () => fetchMyOrders("seller"),
  });

  const mutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "approve" | "reject" | "cancel" | "complete" }) =>
      orderAction(action, id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders", "seller"] });
      const label =
        variables.action === "approve"
          ? "Sipariş onaylandı"
          : variables.action === "reject"
          ? "Sipariş reddedildi"
          : variables.action === "complete"
          ? "Sipariş tamamlandı"
          : "Sipariş iptal edildi";
      toast.success(label);
    },
    onError: () => toast.error("İşlem başarısız"),
  });

  // Filter orders by status and search
  const filteredOrders = useMemo(() => {
    if (!data) return [];

    let filtered = data;

    // Status filter
    if (statusFilter === "PENDING") {
      filtered = filtered.filter((o) => o.status === "PENDING");
    } else if (statusFilter === "ONAY") {
      filtered = filtered.filter((o) => o.status === "ONAY");
    } else if (statusFilter === "COMPLETED") {
      filtered = filtered.filter((o) => o.status === "COMPLETED");
    } else if (statusFilter === "cancelled") {
      filtered = filtered.filter((o) => o.status === "RED" || o.status === "IPTAL");
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.id.toString().includes(query) ||
          order.customer_email?.toLowerCase().includes(query) ||
          order.customer_phone?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [data, statusFilter, searchQuery]);

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  if (isLoading) return <Spinner label="Siparişler yükleniyor..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-slate-900">Gelen Siparişler</h1>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Sipariş ID veya müşteri adına göre ara"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setStatusFilter("PENDING")}
          className={`border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
            statusFilter === "PENDING"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Yeni Siparişler
        </button>
        <button
          onClick={() => setStatusFilter("ONAY")}
          className={`border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
            statusFilter === "ONAY"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Hazırlanıyor
        </button>
        <button
          onClick={() => setStatusFilter("COMPLETED")}
          className={`border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
            statusFilter === "COMPLETED"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Tamamlananlar
        </button>
        <button
          onClick={() => setStatusFilter("cancelled")}
          className={`border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
            statusFilter === "cancelled"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          İptaller
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-500">
              {searchQuery ? "Arama kriterlerinize uygun sipariş bulunamadı." : "Henüz sipariş yok."}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const orderDate = dayjs(order.created_at).format("DD.MM.YYYY");

            return (
              <div
                key={order.id}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                onClick={() => handleOrderClick(order)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">Sipariş #{order.id}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      Müşteri: {order.customer_email?.split("@")[0] || "N/A"}
                    </p>
                    <p className="text-sm text-slate-600">Tarih: {orderDate}</p>

                    {/* Order Items Preview */}
                    <div className="mt-3 space-y-1">
                      {order.items.slice(0, 3).map((item) => (
                        <p key={item.id} className="text-sm text-slate-700">
                          {item.quantity}x {item.product_name} - ₺{Number(item.unit_price * item.quantity).toFixed(2)}
                        </p>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-xs text-slate-500">+{order.items.length - 3} ürün daha...</p>
                      )}
                    </div>

                    <p className="mt-3 text-base font-bold text-slate-900">
                      Toplam: ₺{Number(order.total_amount).toFixed(2)}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="ml-4 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                    {order.status === "PENDING" && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            mutation.mutate({ id: order.id, action: "approve" });
                          }}
                          disabled={mutation.isPending}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white transition-colors hover:bg-green-600 disabled:opacity-50"
                          title="Onayla"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            mutation.mutate({ id: order.id, action: "reject" });
                          }}
                          disabled={mutation.isPending}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                          title="Reddet"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    {order.status === "ONAY" && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            mutation.mutate({ id: order.id, action: "complete" });
                          }}
                          disabled={mutation.isPending}
                          className="rounded-lg bg-green-50 px-4 py-2 text-sm font-semibold text-green-600 transition-colors hover:bg-green-100 disabled:opacity-50"
                        >
                          Tamamlandı
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            mutation.mutate({ id: order.id, action: "cancel" });
                          }}
                          disabled={mutation.isPending}
                          className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                        >
                          İptal
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Order Detail Modal */}
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
