import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { env } from "../../config/env";
import { Product } from "../../types";
import { authStore } from "../../store/auth";
import { LandingNavbar } from "../../components/landing/LandingNavbar";
import { LandingFooter } from "../../components/landing/LandingFooter";
import { FeatureSection } from "../../components/landing/FeatureSection";
import { PricingSection } from "../../components/landing/PricingSection";
import { CTASection } from "../../components/landing/CTASection";
import { HeroSection } from "../../components/landing/HeroSection";
import { LimitedProducts } from "../../components/landing/LimitedProducts";
import { TestimonialsSection } from "../../components/landing/TestimonialsSection";

export const LandingPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const accessToken = authStore((state) => state.accessToken);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setError(null);
      try {
        const response = await fetch(`${env.apiUrl}/api/products?dorm=1`, {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : undefined,
        });
        if (!response.ok) {
          throw new Error("Ürünler şu anda gösterilemiyor.");
        }
        const data = await response.json();
        setProducts(accessToken ? data : data.slice(0, 10));
      } catch (err) {
        setError(
          "Şimdilik sadece örnek ürünleri gösteriyoruz. Giriş yaptıktan sonra tüm menüyü keşfedebilirsin.",
        );
        setProducts([
          {
            id: 1,
            name: "Gece Sandviçi",
            description: "Gece nöbetleri için hazırlanan tost menüsü.",
            price: 120,
            is_active: true,
            is_out_of_stock: false,
            stock_quantity: 8,
            category_id: 1,
            category_name: "Sandviç",
          },
          {
            id: 2,
            name: "Katkı Kahvesi",
            description: "Özel kavrulmuş çekirdeklerle hazırlanan filtre kahve.",
            price: 80,
            is_active: true,
            is_out_of_stock: false,
            stock_quantity: 15,
            category_id: 2,
            category_name: "İçecek",
          },
        ]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [accessToken]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <LandingNavbar />
      <main className="flex flex-col gap-24 pt-16">
        <HeroSection />
        <FeatureSection />
        <LimitedProducts
          products={products}
          loading={loadingProducts}
          error={error}
          limited={!accessToken}
        />
        <StatsSection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
};

const stats = [
  { label: "Aylık sipariş", value: "12.5K+" },
  { label: "Aktif satıcı", value: "480+" },
  { label: "Ortalama teslim", value: "16 dk" },
  { label: "Memnuniyet", value: "4.9 / 5" },
];

const StatsSection = () => (
  <section className="mx-auto max-w-6xl rounded-3xl bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 px-6 py-12 text-white shadow-xl">
    <div className="grid gap-8 md:grid-cols-4">
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <p className="text-4xl font-bold">{stat.value}</p>
          <p className="mt-2 text-sm uppercase tracking-wide text-white/80">
            {stat.label}
          </p>
        </motion.div>
      ))}
    </div>
    <p className="mt-8 text-center text-sm text-white/80">
      Veriler {dayjs().subtract(30, "day").format("DD MMM")} -{" "}
      {dayjs().format("DD MMM")} dönemine aittir.
    </p>
  </section>
);

