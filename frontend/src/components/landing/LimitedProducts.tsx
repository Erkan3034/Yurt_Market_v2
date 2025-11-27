import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Product } from "../../types";

interface LimitedProductsProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  limited?: boolean;
}

export const LimitedProducts = ({ products, loading, error, limited = true }: LimitedProductsProps) => (
  <section id="products" className="mx-auto max-w-6xl px-4">
    <div className="mb-6 flex flex-col gap-3 text-center md:text-left">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
        Yurttaki satıcılar
      </p>
      <h2 className="text-3xl font-bold text-slate-900">
        {limited ? "Üye olmadan 10 ürüne kadar göz at" : "Bugün öne çıkan ürünler"}
      </h2>
      {limited && (
        <p className="text-sm text-slate-500">
          Daha fazla ürün görmek ve sipariş vermek için ücretsiz kayıt ol.
        </p>
      )}
    </div>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {loading
        ? Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="animate-pulse rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-4 h-4 w-32 rounded bg-slate-100" />
              <div className="mb-2 h-6 w-48 rounded bg-slate-100" />
              <div className="mb-4 h-3 w-full rounded bg-slate-100" />
              <div className="h-4 w-20 rounded bg-slate-100" />
            </div>
          ))
        : products.map((product, idx) => (
            <motion.div
              key={product.id ?? idx}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:-translate-y-1 hover:shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <p className="text-xs uppercase tracking-wide text-brand-500">
                {product.category_name ?? "Atıştırmalık"}
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{product.name}</p>
              <p className="mt-2 line-clamp-3 text-sm text-slate-500">{product.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-2xl font-bold text-slate-900">{product.price} ₺</p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    product.is_out_of_stock
                      ? "bg-red-50 text-red-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {product.is_out_of_stock ? "Tükendi" : "Stokta"}
                </span>
              </div>
            </motion.div>
          ))}
    </div>
    {error && (
      <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-700">
        <p>{error}</p>
        <p className="mt-2">
          <Link to="/auth/register" className="font-semibold underline">
            Hemen kaydol
          </Link>{" "}
          ve aktif satıcıların tamamını gör.
        </p>
      </div>
    )}
    {limited && (
      <div className="mt-6 text-center">
        <Link
          to="/auth/register"
          className="inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white"
        >
          Ücretsiz kayıt ol
        </Link>
      </div>
    )}
  </section>
);

