import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSellerProducts, createProduct, deleteProduct } from "../../services/products";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { Spinner } from "../../components/ui/Spinner";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().min(4),
  price: z.coerce.number().min(1),
  category_id: z.coerce.number().min(1),
  stock_quantity: z.coerce.number().min(0),
});

type ProductForm = z.infer<typeof schema>;

export const ProductsPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["seller-products"],
    queryFn: fetchSellerProducts,
  });

  const form = useForm<ProductForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      price: 50,
      category_id: 1,
      stock_quantity: 10,
    },
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      toast.success("Ürün eklendi");
    },
    onError: () => toast.error("Ürün eklenemedi"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["seller-products"],
      });
      toast.success("Ürün silindi");
    },
    onError: () => toast.error("Ürün silinemedi"),
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Yeni ürün ekle</h2>
        <form
          onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}
          className="mt-4 space-y-4"
        >
          <input {...form.register("name")} placeholder="Ürün adı" className="w-full rounded-2xl border-slate-200" />
          <textarea
            {...form.register("description")}
            placeholder="Açıklama"
            className="w-full rounded-2xl border-slate-200"
            rows={3}
          />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <input {...form.register("price")} type="number" placeholder="Fiyat" className="rounded-2xl border-slate-200" />
            <input
              {...form.register("stock_quantity")}
              type="number"
              placeholder="Stok"
              className="rounded-2xl border-slate-200"
            />
            <input
              {...form.register("category_id")}
              type="number"
              placeholder="Kategori ID"
              className="rounded-2xl border-slate-200"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-2xl bg-brand-600 py-2 font-semibold text-white"
            disabled={createMutation.isLoading}
          >
            {createMutation.isLoading ? "Ekleniyor..." : "Ürün ekle"}
          </button>
        </form>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Ürün listesi</h2>
        {isLoading ? (
          <Spinner label="Ürünler yükleniyor..." />
        ) : (
          <div className="mt-4 space-y-3 text-sm">
            {data?.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-900">{product.name}</p>
                  <p className="text-xs text-slate-400">{product.price} ₺ • stok {product.stock_quantity}</p>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(product.id)}
                  className="text-xs font-semibold text-red-500"
                >
                  Sil
                </button>
              </div>
            ))}
            {!data?.length && <p className="text-slate-500">Henüz ürün eklenmedi.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

