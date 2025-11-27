import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchSubscriptionStatus, startSubscription } from "../../services/subscription";
import { toast } from "react-hot-toast";
import { Spinner } from "../../components/ui/Spinner";

const plans = [
  { id: 1, name: "Pro Satıcı", price: 199, description: "Limitsiz ürün, analitik, bildirimler." },
];

export const SubscriptionPage = () => {
  const statusQuery = useQuery({
    queryKey: ["subscription-status"],
    queryFn: fetchSubscriptionStatus,
  });

  const mutation = useMutation({
    mutationFn: (planId: number) => startSubscription(planId),
    onSuccess: (data) => {
      toast.success("Ödeme sayfası açılıyor");
      window.open(data.payment_session.checkout_url ?? data.payment_session.success_url, "_blank");
      statusQuery.refetch();
    },
    onError: () => toast.error("Abonelik başlatılamadı"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Aboneliğin</h1>
        <p className="text-sm text-slate-500">
          Satıcılar için 3 üründen sonra abonelik gereklidir.
        </p>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-slate-600">Durum</p>
        {statusQuery.isLoading ? (
          <Spinner label="Abonelik durumu yükleniyor..." />
        ) : (
          <div className="mt-3">
            <p className="text-lg font-semibold text-slate-900">
              {statusQuery.data?.has_active ? "Aktif abonelik" : "Aktif abonelik yok"}
            </p>
            {statusQuery.data?.expires_at && (
              <p className="text-sm text-slate-500">
                Son kullanma: {new Date(statusQuery.data.expires_at).toLocaleDateString("tr-TR")}
              </p>
            )}
          </div>
        )}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-3xl border border-brand-100 bg-white p-6 shadow-lg">
            <p className="text-sm font-semibold text-brand-600">{plan.name}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{plan.price} ₺ / ay</p>
            <p className="mt-2 text-sm text-slate-500">{plan.description}</p>
            <button
              onClick={() => mutation.mutate(plan.id)}
              className="mt-4 rounded-full bg-brand-600 px-6 py-2 text-sm font-semibold text-white"
              disabled={mutation.isLoading}
            >
              {mutation.isLoading ? "Yönlendiriliyor..." : "Aboneliği başlat"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

