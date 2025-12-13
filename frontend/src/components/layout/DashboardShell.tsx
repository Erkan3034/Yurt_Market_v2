import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { authStore } from "../../store/auth";
import { X, Menu } from "lucide-react"; // Menu ikonunu ekledik

interface DashboardShellProps {
  sidebar: {
    label: string;
    to: string;
    icon?: ReactNode;
  }[];
  children: ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void; // Yeni prop
}

export const DashboardShell = ({ sidebar, children, isOpen, onClose, onOpen }: DashboardShellProps) => {
  const location = useLocation();
  const { user, logout } = authStore();

  const SidebarContent = () => (
    <>
      <div className="mb-8 flex flex-col items-center">
        <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-slate-100 shadow-md">
          {user?.email ? (
            <div className="flex h-full w-full items-center justify-center bg-brand-500 text-white">
              <span className="text-2xl font-bold">{user.email.charAt(0).toUpperCase()}</span>
            </div>
          ) : (
            <div className="h-full w-full bg-slate-300" />
          )}
        </div>
        <p className="mt-4 text-base font-bold text-slate-900">
          {user?.email?.split("@")[0] || "Kullanıcı"}
        </p>
        <p className="mt-1 text-xs font-medium text-slate-500 uppercase tracking-wide">
          {user?.role === "seller" ? "Satıcı Hesabı" : "Öğrenci"}
        </p>
      </div>

      <nav className="flex-1 space-y-2">
        {sidebar.map((item) => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className={`transition-colors ${isActive ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-100">
        <button
          onClick={() => {
            logout();
            if (onClose) onClose();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-red-50 hover:border-red-200 hover:text-red-600 shadow-sm"
        >
          Çıkış Yap
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white p-6 md:flex sticky top-0 h-screen overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* MOBILE SIDEBAR (Drawer) */}
      {isOpen && (
        <div className="relative z-[9999] md:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-[50000ms]" 
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 w-[85%] max-w-xs bg-white p-6 shadow-2xl animate-in slide-in-from-left duration-[50000ms] flex flex-col">
            <button 
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full bg-slate-50 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
                <X className="h-5 w-5" />
            </button>
            <div className="mt-6 flex flex-col h-full">
               <SidebarContent />
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 sm:p-8 overflow-x-hidden w-full">
        
        {/* --- GÜNCELLENEN MOBİL HEADER --- */}
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm md:hidden">
          <div className="flex items-center gap-3">
             {/* MENÜ BUTONU BURAYA EKLENDİ */}
             <button 
                onClick={onOpen}
                className="rounded-lg p-1 -ml-1 text-slate-600 hover:bg-slate-100 transition-colors"
             >
                <Menu className="h-6 w-6" />
             </button>

             <div className="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm">
                {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
                <p className="text-sm font-semibold text-slate-900">
                    {user?.email?.split("@")[0]}
                </p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    {user?.role === "seller" ? "Satıcı" : "Öğrenci"}
                </p>
            </div>
          </div>
        </div>
        
        {children}
      </main>
    </div>
  );
};