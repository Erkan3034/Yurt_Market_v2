import { Link } from "react-router-dom";

export const LandingFooter = () => (
  <footer className="border-t border-slate-200 bg-white">
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
            <div className="h-6 w-6 rounded bg-brand-500" />
          </div>
          <span className="text-lg font-bold text-slate-900">Yurt Market</span>
        </Link>

        {/* Links */}
        <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
          <a href="#about" className="hover:text-brand-600 transition-colors">
            Hakkımızda
          </a>
          <a href="#contact" className="hover:text-brand-600 transition-colors">
            İletişim
          </a>
          <a href="#terms" className="hover:text-brand-600 transition-colors">
            Kullanım Koşulları
          </a>
          <a href="#privacy" className="hover:text-brand-600 transition-colors">
            Gizlilik Politikası
          </a>
        </nav>

        {/* Copyright */}
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} Yurt Market. Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  </footer>
);
