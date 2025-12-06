import { useState } from "react";
import { toast } from "react-hot-toast";
import { Save } from "lucide-react";

export const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    siteName: "Yurt Market",
    maxFreeProducts: 3,
    maintenanceMode: false,
  });

  const handleSave = () => {
    // TODO: Implement settings save API
    toast.success("Ayarlar kaydedildi!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Ayarlar</h1>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          <Save className="h-4 w-4" />
          Kaydet
        </button>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Genel Ayarlar</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="siteName" className="mb-2 block text-sm font-medium text-slate-700">
                Site Adı
              </label>
              <input
                id="siteName"
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label htmlFor="maxFreeProducts" className="mb-2 block text-sm font-medium text-slate-700">
                Ücretsiz Ürün Limiti
              </label>
              <input
                id="maxFreeProducts"
                type="number"
                min="0"
                value={settings.maxFreeProducts}
                onChange={(e) => setSettings({ ...settings, maxFreeProducts: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Sistem Ayarları</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Bakım Modu</p>
                <p className="mt-1 text-xs text-slate-500">Site bakım moduna alınır, sadece admin erişebilir</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-500 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

