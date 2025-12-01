import { useQuery } from "@tanstack/react-query";
import { fetchDormProducts } from "../../services/products";
import { authStore } from "../../store/auth";
import { useMemo, useState } from "react";
import { createOrder } from "../../services/orders";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "../../components/ui/Spinner";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "../../lib/errors";
import { Search, ShoppingCart, User, Plus, Minus, X } from "lucide-react";
import { Link } from "react-router-dom";

type SortOption = "newest" | "name" | "price_asc";

export const ExplorePage = () => {
  const user = authStore((state) => state.user);
  const dormId = user?.dorm_id;
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [cart, setCart] = useState<Record<number, number>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["products", dormId],
    queryFn: () => fetchDormProducts(dormId),
    enabled: Boolean(dormId),
  });

  // Kategorileri ürünlerden çıkar
  const categories = useMemo(() => {
    if (!data) return [];
    const categorySet = new Set<string>();
    data.forEach((product) => {
      if (product.category_name) {
        categorySet.add(product.category_name);
      }
    });
    return Array.from(categorySet).sort();
  }, [data]);

  // Filtrelenmiş ve sıralanmış ürünler
  const filteredProducts = useMemo(() => {
    if (!data) return [];
    let filtered = [...data];

    // Arama filtresi
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.category_name?.toLowerCase().includes(query)
      );
    }

    // Kategori filtresi
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category_name === selectedCategory);
    }

    // Sıralama
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return Number(a.price || 0) - Number(b.price || 0);
        case "name":
          return a.name.localeCompare(b.name, "tr");
        case "newest":
        default:
          return (b.id || 0) - (a.id || 0);
      }
    });

    return filtered;
  }, [data, searchQuery, selectedCategory, sortBy]);

  const addToCart = (productId: number) => {
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] ?? 0) + 1 }));
    toast.success("Sepete eklendi");
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => ({ ...prev, [productId]: quantity }));
  };

  const cartItems = useMemo(() => {
    if (!data) return [];
    return Object.entries(cart)
      .map(([id, quantity]) => {
        const product = data.find((p) => p.id === Number(id));
        return product
          ? {
              product_id: product.id,
              name: product.name,
              price: Number(product.price || 0),
              quantity,
              image: product.category_name || "",
            }
          : null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [cart, data]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const cartCount = useMemo(() => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }, [cart]);

  const orderMutation = useMutation({
    mutationFn: () =>
      createOrder({
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      }),
    onSuccess: () => {
      setCart({});
      toast.success("Siparişin oluşturuldu!");
      queryClient.invalidateQueries({ queryKey: ["orders", "customer"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || "Sipariş oluşturulamadı");
    },
  });

  // Demo ürün görselleri
  const getProductImage = (productName: string) => {
    const images: Record<string, string> = {
      "Protein Bar": "https://images.unsplash.com/photo-1606312619070-d48b4b942fad?w=400&h=400&fit=crop",
      "Soğuk Kahve": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop",
      "Cips Paketi": "https://images.unsplash.com/photo-1612929633736-8c8cb0c8a3e1?w=400&h=400&fit=crop",
      "Enerji İçeceği": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop",
      "Hazır Noodle": "https://images.unsplash.com/photo-1612929633736-8c8cb0c8a3e1?w=400&h=400&fit=crop",
    };
    return images[productName] || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
              <div className="h-6 w-6 rounded bg-brand-500" />
            </div>
            <span className="text-xl font-bold text-slate-900">Yurt Market</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/app/orders"
              className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100"
            >
              <User className="h-5 w-5" />
            </Link>
            <div className="relative">
              <div className="rounded-full p-2 text-slate-600">
                <ShoppingCart className="h-5 w-5" />
              </div>
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - 2 Column Layout */}
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-8">
        {/* Left Column - Product Discovery */}
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Ürünleri Keşfet</h1>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Ürün, kategori veya açıklama"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="space-y-4">
            {/* Kategoriler */}
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">Kategoriler</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    !selectedCategory
                      ? "bg-brand-600 text-white"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Tümü
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      selectedCategory === category
                        ? "bg-brand-600 text-white"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Sırala */}
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">Sırala</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSortBy("newest")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    sortBy === "newest"
                      ? "bg-brand-600 text-white"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  En Yeni
                </button>
                <button
                  onClick={() => setSortBy("name")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    sortBy === "name"
                      ? "bg-brand-600 text-white"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  İsme Göre (A-Z)
                </button>
                <button
                  onClick={() => setSortBy("price_asc")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    sortBy === "price_asc"
                      ? "bg-brand-600 text-white"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Fiyata Göre (Artan)
                </button>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner label="Ürünler yükleniyor..." />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
              <p className="text-lg font-semibold text-slate-900">Ürün bulunamadı</p>
              <p className="mt-2 text-sm text-slate-500">
                {searchQuery || selectedCategory
                  ? "Arama kriterlerinize uygun ürün bulunamadı."
                  : "Henüz bu yurtta ürün bulunmuyor."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => {
                const imageUrl = getProductImage(product.name);
                return (
                  <div
                    key={product.id}
                    className="group rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all hover:shadow-lg"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop";
                        }}
                      />
                      {/* Category Badge */}
                      {product.category_name && (
                        <div className="absolute left-3 top-3 rounded-full bg-brand-600/90 px-3 py-1 text-xs font-semibold text-white">
                          {product.category_name}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{product.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-xl font-bold text-brand-600">₺{Number(product.price || 0).toFixed(2)}</p>
                        <span
                          className={`text-xs font-semibold ${
                            product.is_out_of_stock ? "text-red-500" : "text-emerald-600"
                          }`}
                        >
                          {product.is_out_of_stock ? "Stokta Tükendi" : "Stokta Var"}
                        </span>
                      </div>
                      <button
                        onClick={() => addToCart(product.id)}
                        disabled={product.is_out_of_stock}
                        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                          product.is_out_of_stock
                            ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                            : "bg-brand-600 text-white hover:bg-brand-700"
                        }`}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {product.is_out_of_stock ? "Tükendi" : "Ekle"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column - Shopping Cart Sidebar */}
        <aside className="sticky top-20 h-fit w-80 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Sepetim</h2>

          {cartItems.length === 0 ? (
            <div className="mt-6 text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-sm text-slate-500">Sepetiniz boş</p>
            </div>
          ) : (
            <>
              <div className="mt-6 space-y-4">
                {cartItems.map((item) => {
                  const product = data?.find((p) => p.id === item.product_id);
                  const imageUrl = product ? getProductImage(product.name) : "";
                  return (
                    <div key={item.product_id} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200">
                        <img
                          src={imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                        <p className="text-xs text-slate-500">₺{item.price.toFixed(2)}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-[2ch] text-center text-sm font-semibold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              <div className="mt-6 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Toplam</span>
                  <span className="text-lg font-bold text-slate-900">₺{cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => orderMutation.mutate()}
                disabled={orderMutation.isPending}
                className="mt-4 w-full rounded-full bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-500/40 disabled:opacity-50"
              >
                {orderMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner />
                    Oluşturuluyor...
                  </span>
                ) : (
                  "Siparişi Tamamla"
                )}
              </button>
            </>
          )}
        </aside>
      </div>
    </div>
  );
};
