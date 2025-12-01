import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import banner from "../../assets/banner.png";

export const HeroSection = () => {
  return (
<section className="relative mx-auto mt-6 w-[85%] max-w-[95%] lg:max-w-[1600px] rounded-3xl overflow-hidden min-h-[380px] lg:min-h-[500px] flex items-center justify-start shadow-2xl group">
  {/* Background Image */}
  <img
    src={banner}
    alt="Yurt Market Banner"
    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
  />

  {/* Overlay */}
  <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/20" />

  {/* Content */}
  <div className="relative z-10 w-full px-6 py-12 lg:px-12 lg:py-20">
    <div className="max-w-2xl">
      <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
        Yurt Hayatını Kolaylaştıran Pazar Yerin
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-white/90 sm:text-xl">
        Atıştırmalık, içecek ve tüm ihtiyaçların anında kapında. Yurt Market ile yurt yaşamını daha keyifli hale getir.
      </p>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Link
          to="/app/explore"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-500/40"
        >
          <ShoppingBag className="h-5 w-5" />
          Hemen Keşfet
        </Link>
        <Link
          to="/auth/register?role=seller"
          className="inline-flex items-center justify-center rounded-full border-2 border-white bg-transparent px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/10"
        >
          Mağaza Aç
        </Link>
      </div>
    </div>
  </div>
</section>
  );
};
