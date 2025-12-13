import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSellerProducts, createProduct, deleteProduct, updateProduct, uploadProductImage, deleteProductImage, fetchCategories } from "../../services/products";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../../components/ui/Spinner";
import { Modal } from "../../components/ui/Modal";
import { getErrorMessage } from "../../lib/errors";
import { Trash2, Eye, EyeOff, Pencil, Upload, X, ImageIcon } from "lucide-react";
import { Product } from "../../types";

interface ProductForm {
  name: string;
  description: string;
  price: number;
  category_id: number;
  stock_quantity: number;
}

const schema = z.object({
  name: z.string().min(2, "Ürün adı en az 2 karakter olmalıdır"),
  description: z.string().min(4, "Açıklama en az 4 karakter olmalıdır"),
  price: z.number().min(0.5, "Fiyat en az 0.5 ₺ olmalıdır"),
  category_id: z.number().min(1, "Kategori seçmelisiniz"),
  stock_quantity: z.number().min(0, "Stok 0 veya daha fazla olmalıdır"),
});

export const ProductsPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["seller-products"],
    queryFn: fetchSellerProducts,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const form = useForm<ProductForm>({
    resolver: zodResolver(schema) as any,
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
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      toast.error(message || "Ürün silinemedi");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      updateProduct(id, { is_active }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      toast.success(variables.is_active ? "Ürün aktif edildi" : "Ürün pasif yapıldı");
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      toast.error(message || "Ürün durumu güncellenemedi");
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductForm> }) =>
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      toast.success("Ürün güncellendi");
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      toast.error(message || "Ürün güncellenemedi");
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: ({ productId, file }: { productId: number; file: File }) =>
      uploadProductImage(productId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      toast.success("Fotoğraf yüklendi");
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      toast.error(message || "Fotoğraf yüklenemedi");
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: (productId: number) => deleteProductImage(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      toast.success("Fotoğraf silindi");
      if (editingProduct) {
        setEditingProduct({ ...editingProduct, image_url: null, images: [] });
      }
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      toast.error(message || "Fotoğraf silinemedi");
    },
  });

  const onSubmit = (values: ProductForm) => {
    createMutation.mutate(values);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("edit_name") as string,
      description: formData.get("edit_description") as string,
      price: Number(formData.get("edit_price")),
      category_id: Number(formData.get("edit_category_id")),
      stock_quantity: Number(formData.get("edit_stock_quantity")),
    };
    
    // First update product data
    await editMutation.mutateAsync({ id: editingProduct.id, data });
    
    // Then upload image if selected
    if (selectedImage) {
      await uploadImageMutation.mutateAsync({ productId: editingProduct.id, file: selectedImage });
    }
    
    // Reset and close
    setSelectedImage(null);
    setImagePreview(null);
    setEditingProduct(null);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setSelectedImage(null);
    setImagePreview(null);
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
                    className={`rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${
                      product.is_active ? "border-slate-200" : "border-slate-300 bg-slate-50 opacity-75"
                    }`}
                  >
                    <div className="mb-3 flex gap-3">
                      {/* Product Image Thumbnail */}
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-slate-300" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-lg font-semibold text-slate-900 truncate">{product.name}</h3>
                          <div className="flex shrink-0 gap-1.5">
                            {product.stock_quantity === 0 && (
                              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                                Tükendi
                              </span>
                            )}
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                product.is_active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {product.is_active ? "Aktif" : "Pasif"}
                            </span>
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-slate-600 line-clamp-2">{product.description || "Açıklama yok"}</p>
                      </div>
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
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-100"
                      >
                        <Pencil className="h-4 w-4" />
                        Düzenle
                      </button>
                      <button
                        onClick={() => {
                          toggleActiveMutation.mutate({
                            id: product.id,
                            is_active: !product.is_active,
                          });
                        }}
                        disabled={toggleActiveMutation.isPending}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                          product.is_active
                            ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        }`}
                      >
                        {product.is_active ? (
                          <>
                            <EyeOff className="h-4 w-4" />
                            Pasif Yap
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            Aktif Yap
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
                            deleteMutation.mutate(product.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="flex items-center gap-1.5 text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Sil
                      </button>
                    </div>
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

      {/* Edit Product Modal */}
      <Modal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        title="Ürün Düzenle"
      >
        {editingProduct && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {/* Product Name */}
            <div>
              <label htmlFor="edit_name" className="mb-2 block text-sm font-medium text-slate-700">
                Ürün Adı
              </label>
              <input
                name="edit_name"
                id="edit_name"
                type="text"
                defaultValue={editingProduct.name}
                required
                minLength={2}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="edit_description" className="mb-2 block text-sm font-medium text-slate-700">
                Açıklama
              </label>
              <textarea
                name="edit_description"
                id="edit_description"
                defaultValue={editingProduct.description}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit_price" className="mb-2 block text-sm font-medium text-slate-700">
                  Fiyat (₺)
                </label>
                <input
                  name="edit_price"
                  id="edit_price"
                  type="number"
                  step="0.01"
                  min="0.5"
                  defaultValue={editingProduct.price}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label htmlFor="edit_stock_quantity" className="mb-2 block text-sm font-medium text-slate-700">
                  Stok
                </label>
                <input
                  name="edit_stock_quantity"
                  id="edit_stock_quantity"
                  type="number"
                  min="0"
                  defaultValue={editingProduct.stock_quantity}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="edit_category_id" className="mb-2 block text-sm font-medium text-slate-700">
                Kategori
              </label>
              <select
                name="edit_category_id"
                id="edit_category_id"
                defaultValue={editingProduct.category_id}
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
            </div>

            {/* Product Image */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Ürün Fotoğrafı
              </label>
              
              {/* Current or Preview Image */}
              {(imagePreview || editingProduct.image_url) && (
                <div className="relative mb-3 inline-block">
                  <img
                    src={imagePreview || editingProduct.image_url || ""}
                    alt="Ürün fotoğrafı"
                    className="h-24 w-24 rounded-lg object-cover border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (imagePreview) {
                        setSelectedImage(null);
                        setImagePreview(null);
                      } else if (editingProduct.image_url) {
                        deleteImageMutation.mutate(editingProduct.id);
                      }
                    }}
                    disabled={deleteImageMutation.isPending}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {/* Upload Button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600"
                >
                  {imagePreview || editingProduct.image_url ? (
                    <>
                      <Upload className="h-4 w-4" />
                      Fotoğrafı Değiştir
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4" />
                      Fotoğraf Yükle
                    </>
                  )}
                </button>
                <p className="mt-1 text-xs text-slate-500">JPG, PNG veya GIF (max. 5MB)</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                className="flex-1 rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={editMutation.isPending || uploadImageMutation.isPending}
                className="flex-1 rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
              >
                {editMutation.isPending || uploadImageMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
};
