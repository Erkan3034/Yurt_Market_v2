export const Spinner = ({ label }: { label?: string }) => (
  <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    {label ?? "Yükleniyor..."}
  </div>
);

