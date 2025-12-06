import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { authStore } from "../../store/auth";

interface DashboardShellProps {
  sidebar: {
    label: string;
    to: string;
    icon?: ReactNode;
  }[];
  children: ReactNode;
}

export const DashboardShell = ({ sidebar, children }: DashboardShellProps) => {
  const location = useLocation();
  const { user, logout } = authStore();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-6 md:flex">
        {/* User Profile */}
        <div className="mb-6 flex flex-col items-center">
          <div className="h-16 w-16 overflow-hidden rounded-full bg-slate-200">
            {user?.email ? (
              <div className="flex h-full w-full items-center justify-center bg-brand-500 text-white">
                <span className="text-xl font-semibold">{user.email.charAt(0).toUpperCase()}</span>
              </div>
            ) : (
              <div className="h-full w-full bg-slate-300" />
            )}
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-900">
            {user?.email?.split("@")[0] || "Seller Name"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {user?.role === "seller" ? "Yurt Market Seller" : "Student"}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {sidebar.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                location.pathname === item.to || location.pathname.startsWith(item.to + "/")
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={logout}
          className="mt-auto rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          Çıkış yap
        </button>
      </aside>
      <main className="flex-1 p-6">
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 md:hidden">
          <p className="text-sm font-semibold text-slate-900">{user?.email}</p>
          <button className="text-xs text-brand-600" onClick={logout}>
            Çıkış
          </button>
        </div>
        {children}
      </main>
    </div>
  );
};

