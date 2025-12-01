import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { register as registerUser } from "../../services/auth";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authStore } from "../../store/auth";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../lib/errors";
import { fetchDorms } from "../../services/dorms";
import type { Dorm } from "../../types";
import { Eye, EyeOff } from "lucide-react";
import banner from "../../assets/banner.png";

// Validation Schema
const schema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(6, "Şifre en az 6 karakter"),
  dorm_name: z.string().min(2, "Yurt adı gerekli"),
  dorm_address: z.string().optional(),
  role: z.enum(["student", "seller"]),
  phone: z.string().optional(),
  iban: z.string().optional(),
});

type RegisterForm = z.infer<typeof schema>;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // URL'den role bilgisini al
  const roleFromUrl = searchParams.get("role") as "student" | "seller" | null;

  const { register, handleSubmit, watch, formState, setValue, setError: setFieldError, clearErrors } =
    useForm<RegisterForm>({
      resolver: zodResolver(schema),
      defaultValues: {
        email: "",
        password: "",
        dorm_name: "",
        dorm_address: "",
        role: roleFromUrl === "seller" ? "seller" : "student",
        phone: "",
        iban: "",
      },
    });

  // URL'den gelen role'ü form'a set et
  useEffect(() => {
    if (roleFromUrl === "seller") {
      setValue("role", "seller");
    }
  }, [roleFromUrl, setValue]);

  const role = watch("role");
  const dormName = watch("dorm_name");

  const dormQuery = useQuery({
    queryKey: ["dorms"],
    queryFn: fetchDorms,
  });

  const dorms = Array.isArray(dormQuery.data) ? dormQuery.data : [];

  const selectedDorm: Dorm | undefined = useMemo(() => {
    if (!dormName?.trim()) return undefined;
    return dorms.find((dorm) => dorm.name.toLowerCase() === dormName.trim().toLowerCase());
  }, [dormName, dorms]);

  useEffect(() => {
    if (selectedDorm) {
      setValue("dorm_address", selectedDorm.address ?? "");
      clearErrors("dorm_address");
    }
  }, [selectedDorm, setValue, clearErrors]);

  const mutation = useMutation({
    mutationFn: (payload: RegisterForm) =>
      registerUser({
        ...payload,
        dorm_address: selectedDorm?.address ?? payload.dorm_address,
      }),
    onSuccess: () => {
      setServerError(null);
      toast.success("Hesabın oluşturuldu!");
      const userRole = authStore.getState().user?.role;
      navigate(userRole === "seller" ? "/seller/products" : "/app/explore");
    },
    onError: (err: any) => {
      const message = getErrorMessage(err, "Kayıt sırasında hata oluştu");
      setServerError(message);
      toast.error(message);
    },
  });

  const onSubmit = (data: RegisterForm) => {
    if (!selectedDorm && !data.dorm_address?.trim()) {
      setFieldError("dorm_address", {
        type: "manual",
        message: "Listede olmayan yurtlar için adres zorunludur.",
      });
      return;
    }
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
                <div className="h-6 w-6 rounded bg-brand-500" />
              </div>
              <span className="text-xl font-bold text-slate-900">Yurt Market</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm text-slate-600">Zaten hesabın var mı?</span>
              <Link
                to="/auth/login"
                className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Giriş yap
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Panel - Welcome Section */}
          <div className="hidden lg:block">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Yurt Market'e Hoş Geldin!
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              Hesap oluşturarak yurt hayatını kolaylaştır.
            </p>
            <div className="relative rounded-3xl overflow-hidden bg-orange-500 aspect-[4/3] max-w-lg shadow-xl">
              <img
                src={banner}
                alt="Yurt Market"
                className="h-full w-full object-cover opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-600/20" />
            </div>
          </div>

          {/* Right Panel - Compact Form */}
          <div className="w-full max-w-md mx-auto lg:ml-auto">
            <div className="bg-white rounded-2xl p-5 shadow-lg">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                
                {/* Role Selection */}
                <div>
                  <label className="text-sm font-semibold text-slate-900 mb-1.5 block">
                    Rolün Nedir?
                  </label>
                  <div className="flex gap-3">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="radio"
                        value="student"
                        {...register("role")}
                        className="peer sr-only"
                      />
                      <div className="rounded-lg border-2 border-slate-200 p-2.5 text-center transition-all peer-checked:border-brand-600 peer-checked:bg-brand-50">
                        <span className="text-sm font-semibold text-slate-900">Öğrenci</span>
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="radio"
                        value="seller"
                        {...register("role")}
                        className="peer sr-only"
                      />
                      <div className="rounded-lg border-2 border-slate-200 p-2.5 text-center transition-all peer-checked:border-brand-600 peer-checked:bg-brand-50">
                        <span className="text-sm font-semibold text-slate-900">Satıcı</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-semibold text-slate-900 mb-1 block">
                    E-posta Adresi
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="ornek@email.com"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  {formState.errors.email && (
                    <p className="mt-0.5 text-[10px] text-red-500">{formState.errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs font-semibold text-slate-900 mb-1 block">
                    Şifre
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      placeholder="Şifrenizi oluşturun"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formState.errors.password && (
                    <p className="mt-0.5 text-[10px] text-red-500">{formState.errors.password.message}</p>
                  )}
                </div>

                {/* Dorm Name */}
                <div>
                  <label className="text-xs font-semibold text-slate-900 mb-1 block">
                    Yurt Adı
                  </label>
                  <input
                    list="dorm-options"
                    {...register("dorm_name")}
                    placeholder="Yurdunu seç veya yazmaya başla"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <datalist id="dorm-options">
                    {dorms.map((dorm) => (
                      <option key={dorm.id} value={dorm.name}>
                        {dorm.address}
                      </option>
                    ))}
                  </datalist>
                  {formState.errors.dorm_name && (
                    <p className="mt-0.5 text-[10px] text-red-500">{formState.errors.dorm_name.message}</p>
                  )}
                </div>

                {/* Dorm Address (if not in list) */}
                {!selectedDorm && (
                  <div>
                    <label className="text-xs font-semibold text-slate-900 mb-1 block">
                      Yurt Adresi
                    </label>
                    <textarea
                      {...register("dorm_address")}
                      placeholder="Yurdun açık adresi"
                      rows={2}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                    {formState.errors.dorm_address && (
                      <p className="mt-0.5 text-[10px] text-red-500">
                        {formState.errors.dorm_address.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Seller Fields */}
                {role === "seller" && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-slate-900 mb-1 block">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        {...register("phone")}
                        placeholder="05XX XXX XX XX"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-900 mb-1 block">
                        IBAN
                      </label>
                      <input
                        type="text"
                        {...register("iban")}
                        placeholder="TR00..."
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                  </>
                )}

                {/* Error Message */}
                {serverError && (
                  <div className="rounded-lg bg-red-50 p-2 text-xs text-red-600">{serverError}</div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/30 transition-all hover:bg-brand-700 hover:shadow-lg disabled:opacity-50 mt-2"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Kaydediliyor..." : "Kaydı Tamamla"}
                </button>

                {/* Terms */}
                <p className="text-[10px] text-center text-slate-500 mt-2">
                  Kaydolarak{" "}
                  <Link to="#terms" className="text-brand-600 hover:underline">
                    Kullanım Koşulları
                  </Link>
                  'nı ve{" "}
                  <Link to="#privacy" className="text-brand-600 hover:underline">
                    Gizlilik Politikası
                  </Link>
                  'nı kabul etmiş olursun.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};