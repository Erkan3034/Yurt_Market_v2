import { useQuery } from "@tanstack/react-query";
import { fetchDormProducts } from "../../services/products";
import { authStore } from "../../store/auth";
import { useMemo, useState } from "react";
import { createOrder } from "../../services/orders";
import { useMutation } from "@tanstack/react-query";
import { Spinner } from "../../components/ui/Spinner";
import { toast } from "react-hot-toast";

export const ExplorePage = () => {
  const user = authStore((state) => state.user);
  const dormId = user?.dorm_id;
  const { data, isLoading } = useQuery({
    queryKey: ["products", dormId],
    queryFn: () => fetchDormProducts(dormId),
    enabled: Boolean(dormId),
  });

  const [cart, setCart] = useState<Record<number, number>>({});

  const addToCart = (productId: number) => {
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] ?? 0) + 1 }));
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const cartItems = useMemo(() => {
    if (!data) return [];
    return Object.entries(cart).map(([id, quantity]) => {
      const product = data.find((p) => p.id === Number(id));
      return product
        ? {
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity,
          }
        : null;
    });
  }, [cart, data]);

  const orderMutation = useMutation({
    mutationFn: () =>
      createOrder({
        items: cartItems.map((item) => ({
          product_id: item!.product_id,
          quantity: item!.quantity,
        })),
      }),
    onSuccess: () => {
      setCart({});
      toast.success("Siparişin oluşturuldu!");
    },
    onError: () => toast.error("Sipariş oluşturulamadı"),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900">Dorman ürünleri</h1>
        <p className="text-sm text-slate-500">
          Yalnızca {user?.dorm_id}. yurt satıcılarını görüyorsun.
        </p>
      </div>
      {isLoading ? (
        <Spinner label="Ürünler yükleniyor..." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data?.map((product) => (
            <div
              key={product.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm uppercase text-slate-400">
                    {product.category_name ?? "Kategori"}
                  </p>
                  <p className="text-xl font-semibold text-slate-900">{product.name}</p>
                </div>
                <p className="text-lg font-bold text-brand-600">{product.price} ₺</p>
              </div>
              <p className="mt-2 text-sm text-slate-500 line-clamp-3">{product.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`text-xs font-semibold ${
                    product.is_out_of_stock ? "text-red-500" : "text-emerald-600"
                  }`}
                >
                  {product.is_out_of_stock ? "Tükendi" : `${product.stock_quantity} adet`}
                </span>
                <button
                  onClick={() => addToCart(product.id)}
                  disabled={product.is_out_of_stock}
                  className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                >
                  Sepete ekle
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900">Sepetin</p>
            <p className="text-sm text-slate-500">
              {cartItems.length} ürün ·{" "}
              {cartItems.reduce((sum, item) => sum + (item?.price ?? 0) * (item?.quantity ?? 0), 0)} ₺
            </p>
          </div>
          <button
            onClick={() => orderMutation.mutate()}
            disabled={!cartItems.length || orderMutation.isLoading}
            className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            Siparişi oluştur
          </button>
        </div>
        {cartItems.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Sepet boş.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100 text-sm">
            {cartItems.map((item) => (
              <li key={item?.product_id} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-semibold text-slate-800">{item?.name}</p>
                  <p className="text-xs text-slate-500">
                    {item?.quantity} x {item?.price} ₺
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item!.product_id)}
                  className="text-xs font-semibold text-red-500"
                >
                  kaldır
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

