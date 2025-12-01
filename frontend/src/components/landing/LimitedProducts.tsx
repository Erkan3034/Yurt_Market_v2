import { Product } from "../../types";

interface LimitedProductsProps {
  products: Product[];
  loading: boolean;
  limited?: boolean;
}

export const LimitedProducts = ({ products, loading }: LimitedProductsProps) => {
  // Demo ürün görselleri (gerçek uygulamada API'den gelecek)
  const productImages: Record<string, string> = {
    "Protein Bar": "https://images.unsplash.com/photo-1606312619070-d48b4b942fad?w=400&h=400&fit=crop",
    "Soğuk Kahve": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop",
    "Cips Paketi": "https://images.unsplash.com/photo-1612929633736-8c8cb0c8a3e1?w=400&h=400&fit=crop",
    "Enerji İçeceği": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop",
    "Hazır Noodle": "https://images.unsplash.com/photo-1612929633736-8c8cb0c8a3e1?w=400&h=400&fit=crop",
  };

  // İlk 5 ürünü göster veya demo ürünler
  const displayProducts = products.slice(0, 5).length > 0 
    ? products.slice(0, 5)
    : [
        { id: 1, name: "Protein Bar", price: 25.0, category_name: "Atıştırmalık", is_out_of_stock: false },
        { id: 2, name: "Soğuk Kahve", price: 20.0, category_name: "İçecek", is_out_of_stock: false },
        { id: 3, name: "Cips Paketi", price: 18.5, category_name: "Atıştırmalık", is_out_of_stock: false },
        { id: 4, name: "Enerji İçeceği", price: 30.0, category_name: "İçecek", is_out_of_stock: false },
        { id: 5, name: "Hazır Noodle", price: 17.5, category_name: "Atıştırmalık", is_out_of_stock: false },
      ];

  return (
    <section id="products" className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Popüler Ürünler</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-6 min-w-max">
            {displayProducts.map((product, idx) => {
              const imageUrl = productImages[product.name] || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop";
              return (
                <div
                  key={product.id ?? idx}
                  className="flex-shrink-0 w-64 rounded-2xl bg-white shadow-sm overflow-hidden"
                >
                  <div className="aspect-square w-full bg-slate-100 overflow-hidden rounded-t-2xl">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop";
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">₺{Number(product.price || 0).toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
