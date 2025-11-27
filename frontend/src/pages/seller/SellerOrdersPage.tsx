import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyOrders, orderAction } from "../../services/orders";
import { toast } from "react-hot-toast";
import { Spinner } from "../../components/ui/Spinner";

export const SellerOrdersPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["orders", "seller"],
    queryFn: () => fetchMyOrders("seller"),
  });

  const mutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "approve" | "reject" | "cancel" }) =>
      orderAction(action, id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders", "seller"] });
      const label =
        variables.action === "approve"
          ? "Sipariş onaylandı"
          : variables.action === "reject"
          ? "Sipariş reddedildi"
          : "Sipariş iptal edildi";
      toast.success(label);
    },
    onError: () => toast.error("İşlem başarısız"),
  });

  if (isLoading) return <Spinner label="Siparişler yükleniyor..." />;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-slate-900">Sipariş yönetimi</h1>
      <div className="space-y-4">
        {data?.map((order) => (
          <div key={order.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-slate-900">#{order.id}</p>
              <div className="flex gap-2 text-xs font-semibold">
                <button
                  onClick={() => mutation.mutate({ id: order.id, action: "approve" })}
                  className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-600"
                >
                  Onayla
                </button>
                <button
                  onClick={() => mutation.mutate({ id: order.id, action: "reject" })}
                  className="rounded-full bg-amber-50 px-3 py-1 text-amber-600"
                >
                  Reddet
                </button>
                <button
                  onClick={() => mutation.mutate({ id: order.id, action: "cancel" })}
                  className="rounded-full bg-red-50 px-3 py-1 text-red-600"
                >
                  İptal
                </button>
              </div>
            </div>
            <ul className="mt-3 text-sm text-slate-600">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.product_name} x{item.quantity} = {item.unit_price * item.quantity} ₺
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

