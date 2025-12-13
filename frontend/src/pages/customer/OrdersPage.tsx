import { useQuery } from "@tanstack/react-query";
import { fetchMyOrders } from "../../services/orders";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import { Spinner } from "../../components/ui/Spinner";
import { useState } from "react";
import { ChevronDown, ChevronUp, Search, ShoppingCart, Bell, User } from "lucide-react";
import { Link } from "react-router-dom";

dayjs.locale("tr");

const getStatusInfo = (status: string) => {
  switch (status) {
    case "ONAY":
      return { label: "Hazırlanıyor", className: "bg-yellow-100 text-yellow-700" };
    case "PENDING":
      return { label: "Beklemede", className: "bg-blue-100 text-blue-700" };
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

const formatOrderNumber = (id: number) => {
  return `#YM${id.toString().padStart(5, "0")}`;
};

export const OrdersPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["orders", "customer"],
    queryFn: () => fetchMyOrders("customer"),
  });
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

  const toggleOrder = (orderId: number) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  if (isLoading) return <Spinner label="Siparişlerin yükleniyor..." />;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
              <div className="h-6 w-6 rounded bg-brand-500" />
            </div>
            <span className="text-xl font-bold text-slate-900">Yurt Market</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Ara"
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              to="/app/explore"
              className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
            >
              Ana Sayfa
            </Link>
            <Link
              to="/app/explore"
              className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
            >
              Kategoriler
            </Link>
            <Link
              to="/app/orders"
              className="text-sm font-semibold text-brand-600 transition-colors"
            >
              Siparişlerim
            </Link>
            <Link
              to="/app/explore"
              className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
            >
              Hesabım
            </Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <button className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100">
              <ShoppingCart className="h-5 w-5" />
            </button>
            <button className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
              <User className="h-5 w-5 text-slate-600" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">Siparişlerim</h1>

        {!data?.length ? (
          <p className="text-sm text-slate-500">Henüz siparişin yok.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {data.map((order) => {
              const isExpanded = expandedOrders.has(order.id);
              const statusInfo = getStatusInfo(order.status);
              const orderDate = dayjs(order.created_at).format("D MMMM YYYY");

              return (
                <div
                  key={order.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
                >
                  {/* Order Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Sipariş {formatOrderNumber(order.id)}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {orderDate} - ₺{Number(order.total_amount).toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.className}`}
                      >
                        {statusInfo.label}
                      </span>
                      <button
                        onClick={() => toggleOrder(order.id)}
                        className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Order Content (Expandable) */}
                  {isExpanded && (
                    <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
                      {/* Sipariş İçeriği */}
                      <div>
                        <h4 className="mb-3 text-sm font-semibold text-slate-900">Sipariş İçeriği</h4>
                        <ul className="space-y-2">
                          {order.items.map((item) => (
                            <li key={item.id} className="text-sm text-slate-600">
                              {item.quantity}x {item.product_name} - ₺{Number(item.unit_price * item.quantity).toFixed(2).replace(".", ",")}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Ödeme ve Teslimat Bilgileri */}
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="mb-2 text-sm font-semibold text-slate-900">Ödeme Bilgileri</h4>
                          <div className="space-y-1 text-sm text-slate-600">
                            <p><span className="font-medium">Yöntem:</span> {order.payment_method_display || "Teslim Anında Ödeme"}</p>
                            <p><span className="font-medium">Toplam:</span> ₺{Number(order.total_amount).toFixed(2).replace(".", ",")}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="mb-2 text-sm font-semibold text-slate-900">Teslimat Bilgileri</h4>
                          <div className="space-y-1 text-sm text-slate-600">
                            <p><span className="font-medium">Şekil:</span> {order.delivery_type_display || "Müşteri Alacak"}</p>
                            {order.delivery_address && (
                              <p><span className="font-medium">Adres:</span> {order.delivery_address}</p>
                            )}
                            {order.delivery_phone && (
                              <p><span className="font-medium">Telefon:</span> {order.delivery_phone}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Satıcı Bilgileri (Eğer müşteri alacaksa) */}
                      {order.delivery_type === "customer_pickup" && order.seller_phone && (
                        <div>
                          <h4 className="mb-2 text-sm font-semibold text-slate-900">Satıcı İletişim Bilgileri</h4>
                          <div className="space-y-1 text-sm text-slate-600">
                            <p><span className="font-medium">Telefon:</span> {order.seller_phone}</p>
                            {order.seller_room && (
                              <p><span className="font-medium">Adres:</span> {order.seller_room}</p>
                            )}
                            {order.seller_email && (
                              <p><span className="font-medium">E-posta:</span> {order.seller_email}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Sipariş Notu */}
                      {order.notes && (
                        <div>
                          <h4 className="mb-2 text-sm font-semibold text-slate-900">Sipariş Notu</h4>
                          <p className="text-sm text-slate-600">{order.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

