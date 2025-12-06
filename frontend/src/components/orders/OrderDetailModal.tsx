import { X } from "lucide-react";
import { Order } from "../../types";
import dayjs from "dayjs";
import "dayjs/locale/tr";

dayjs.locale("tr");

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

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

export const OrderDetailModal = ({ order, isOpen, onClose }: OrderDetailModalProps) => {
  if (!isOpen || !order) return null;

  const statusInfo = getStatusInfo(order.status);
  const orderDate = dayjs(order.created_at).format("DD.MM.YYYY");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Sipariş Detayları</h2>
            <p className="mt-1 text-sm text-slate-500">Sipariş #{order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Status */}
            <div>
              <p className="text-sm font-medium text-slate-600">Durum</p>
              <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.className}`}>
                {statusInfo.label}
              </span>
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">Müşteri Bilgileri</h3>
              <div className="space-y-1 text-sm text-slate-600">
                <p>
                  <span className="font-medium">Ad:</span> {order.customer_email?.split("@")[0] || "N/A"}
                </p>
                <p>
                  <span className="font-medium">E-posta:</span> {order.customer_email || "N/A"}
                </p>
                {order.customer_phone && (
                  <p>
                    <span className="font-medium">Telefon:</span> {order.customer_phone}
                  </p>
                )}
                {order.customer_room && (
                  <p>
                    <span className="font-medium">Adres:</span> {order.customer_room}
                  </p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">Sipariş İçeriği</h3>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.product_name}</p>
                      <p className="text-xs text-slate-500">Adet: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      ₺{Number(item.unit_price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment & Delivery */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">Ödeme Bilgileri</h3>
                <div className="space-y-1 text-sm text-slate-600">
                  <p>
                    <span className="font-medium">Yöntem:</span>{" "}
                    {order.payment_method === "cash_on_delivery" ? "Teslim Anında Ödeme" : order.payment_method}
                  </p>
                  <p>
                    <span className="font-medium">Toplam:</span> ₺{Number(order.total_amount).toFixed(2)}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">Teslimat Bilgileri</h3>
                <div className="space-y-1 text-sm text-slate-600">
                  <p>
                    <span className="font-medium">Şekil:</span>{" "}
                    {order.delivery_type === "customer_pickup"
                      ? "Müşteri Alacak"
                      : order.delivery_type === "seller_delivery"
                      ? "Satıcı Getirecek"
                      : order.delivery_type}
                  </p>
                  {order.delivery_address && (
                    <p>
                      <span className="font-medium">Adres:</span> {order.delivery_address}
                    </p>
                  )}
                  {order.delivery_phone && (
                    <p>
                      <span className="font-medium">Telefon:</span> {order.delivery_phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">Sipariş Notu</h3>
                <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  {order.notes}
                </p>
              </div>
            )}

            {/* Date */}
            <div>
              <p className="text-sm text-slate-500">
                <span className="font-medium">Tarih:</span> {orderDate}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

