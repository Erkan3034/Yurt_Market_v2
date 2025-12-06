import { useQuery } from "@tanstack/react-query";
import { fetchAdminProducts } from "../../services/admin";
import { Spinner } from "../../components/ui/Spinner";
import { Product } from "../../types";
import dayjs from "dayjs";
import "dayjs/locale/tr";

dayjs.locale("tr");

export const AdminProductsPage = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: fetchAdminProducts,
  });

  if (isLoading) return <Spinner label="Ürünler yükleniyor..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Ürünler</h1>
        <p className="text-sm text-slate-600">Toplam {products?.length || 0} ürün</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">Ürün Adı</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">Satıcı</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">Kategori</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">Fiyat</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">Stok</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {products && products.length > 0 ? (
              products.map((product: Product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{product.name}</p>
                      {product.description && (
                        <p className="mt-1 text-xs text-slate-500 line-clamp-1">{product.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">ID: {product.seller_id || "N/A"}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{product.category_name || "N/A"}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    ₺{Number(product.price).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{product.stock_quantity || 0}</td>
                  <td className="px-6 py-4">
                    {product.is_active ? (
                      <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                        Pasif
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                  Henüz ürün yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

