import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSellerProducts, createProduct, deleteProduct, fetchCategories } from "../../services/products";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../../components/ui/Spinner";
import { Modal } from "../../components/ui/Modal";
import { getErrorMessage } from "../../lib/errors";
import { Trash2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Ürün adı en az 2 karakter olmalıdır"),
  description: z.string().min(4, "Açıklama en az 4 karakter olmalıdır"),
  price: z.coerce.number().min(0.5, "Fiyat en az 0.5 ₺ olmalıdır"),
  category_id: z.coerce.number().min(1, "Kategori seçmelisiniz"),
  stock_quantity: z.coerce.number().min(0, "Stok 0 veya daha fazla olmalıdır"),
});

type ProductForm = z.infer<typeof schema>;

export const ProductsPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["seller-products"],
    queryFn: fetchSellerProducts,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const form = useForm<ProductForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      price: 15.0,
      category_id: categories?.[0]?.id || 0,
      stock_quantity: 50,
    },
  });

  // Update default category when categories load
  if (categories && categories.length > 0 && !form.getValues("category_id")) {
    form.setValue("category_id", categories[0].id);
  }

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      form.reset({
        name: "",
        description: "",
        price: 15.0,
        category_id: categories?.[0]?.id || 0,
        stock_quantity: 50,
      });
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      toast.success("Ürün başarıyla eklendi!");
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      // Abonelik limiti hatası ise modal aç
      if (message.toLowerCase().includes("subscribe") || message.toLowerCase().includes("abonelik")) {
        setShowSubscriptionModal(true);
        return;
      }
      toast.error(message || "Ürün eklenemedi");
    },
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

  const onSubmit = (values: ProductForm) => {
    createMutation.mutate(values);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Ürün Yönetimi</h1>
          <p className="mt-2 text-slate-600">Yeni ürünler ekleyin ve mevcut ürünlerinizi yönetin.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Panel - Add Product Form */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-slate-900">Yeni Ürün Ekle</h2>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Product Name */}
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
                  Ürün Adı
                </label>
                <input
                  {...form.register("name")}
                  id="name"
                  type="text"
                  placeholder="Örn: Çikolatalı Gofret"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                {form.formState.errors.name && (
                  <p className="mt-1 text-xs text-red-600">{form.formState.errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-700">
                  Açıklama
                </label>
                <textarea
                  {...form.register("description")}
                  id="description"
                  placeholder="Ürününüz hakkında detaylı bilgi verin"
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                {form.formState.errors.description && (
                  <p className="mt-1 text-xs text-red-600">{form.formState.errors.description.message}</p>
                )}
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="mb-2 block text-sm font-medium text-slate-700">
                    Fiyat (₺)
                  </label>
                  <input
                    {...form.register("price")}
                    id="price"
                    type="number"
                    step="0.01"
                    min="0.5"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  {form.formState.errors.price && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.price.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="stock_quantity" className="mb-2 block text-sm font-medium text-slate-700">
                    Stok
                  </label>
                  <input
                    {...form.register("stock_quantity")}
                    id="stock_quantity"
                    type="number"
                    min="0"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  {form.formState.errors.stock_quantity && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.stock_quantity.message}</p>
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category_id" className="mb-2 block text-sm font-medium text-slate-700">
                  Kategori
                </label>
                {categoriesLoading ? (
                  <div className="h-11 w-full rounded-lg border border-slate-300 bg-slate-50" />
                ) : (
                  <select
                    {...form.register("category_id")}
                    id="category_id"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    {categories && categories.length > 0 ? (
                      categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))
                    ) : (
                      <option value={0}>Kategori bulunamadı</option>
                    )}
                  </select>
                )}
                {form.formState.errors.category_id && (
                  <p className="mt-1 text-xs text-red-600">{form.formState.errors.category_id.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={createMutation.isPending || categoriesLoading}
                className="w-full rounded-lg bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
              >
                {createMutation.isPending ? "Ekleniyor..." : "Ürün Ekle"}
              </button>
            </form>
          </div>

          {/* Right Panel - Product Grid */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Mevcut Ürünler</h2>
            {productsLoading ? (
              <Spinner label="Ürünler yükleniyor..." />
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                      <p className="mt-1 text-sm text-slate-600">{product.description || "Açıklama yok"}</p>
                    </div>
                    <div className="mb-3 space-y-1">
                      <p className="text-base font-bold text-slate-900">
                        {Number(product.price).toFixed(2)} ₺
                      </p>
                      <p
                        className={`text-sm ${
                          product.stock_quantity > 0 ? "text-slate-600" : "text-red-500"
                        }`}
                      >
                        {product.stock_quantity > 0
                          ? `Stok: ${product.stock_quantity} adet`
                          : "Stok Tükendi"}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
                          deleteMutation.mutate(product.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="flex items-center gap-2 text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                <p className="text-slate-500">Henüz ürün eklenmedi.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      <Modal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        title="Ürün Limiti Doldu"
      >
        <div className="space-y-4">
          <p className="text-slate-700">
            Ücretsiz ürün hakkın doldu. Daha fazla ürün eklemek için abonelik planını yükseltmelisin.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowSubscriptionModal(false);
                navigate("/seller/subscription");
              }}
              className="flex-1 rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              Plan Yükselt
            </button>
            <button
              onClick={() => setShowSubscriptionModal(false)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              İptal
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
