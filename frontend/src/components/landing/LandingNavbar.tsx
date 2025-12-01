import { Link } from "react-router-dom";
import { authStore } from "../../store/auth";

export const LandingNavbar = () => {
  const user = authStore((state) => state.user);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
            <div className="h-6 w-6 rounded bg-brand-500" />
          </div>
          <span className="text-xl font-bold text-slate-900">Yurt Market</span>
        </Link>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link
                to="/auth/login"
                className="rounded-full border-2 border-brand-300 bg-white px-5 py-2 text-sm font-semibold text-brand-600 transition-colors hover:border-brand-400 hover:bg-brand-50"
              >
                Giriş Yap
              </Link>
              <Link
                to="/auth/register"
                className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 shadow-sm"
              >
                Kayıt Ol
              </Link>
            </>
          ) : (
            <Link
              to="/app/explore"
              className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 shadow-sm"
            >
              Ürünleri Keşfet
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
