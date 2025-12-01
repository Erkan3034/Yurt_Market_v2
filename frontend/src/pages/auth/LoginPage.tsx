import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { login } from "../../services/auth";
import { authStore } from "../../store/auth";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../lib/errors";
import { Eye, EyeOff } from "lucide-react";
import banner from "../../assets/banner.png"; // RegisterPage'deki aynı görseli kullanıyoruz

const schema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

type LoginForm = z.infer<typeof schema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: ({ email, password }: LoginForm) => login(email, password),
    onSuccess: () => {
      setServerError(null);
      toast.success("Giriş başarılı!");
      const role = authStore.getState().user?.role;
      navigate(role === "seller" ? "/seller/products" : "/app/explore");
    },
    onError: (error: any) => {
      const message = getErrorMessage(error, "Giriş başarısız oldu");
      setServerError(message);
      toast.error(message);
    },
  });

  const onSubmit = (data: LoginForm) => mutation.mutate(data);

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
              <span className="hidden sm:inline text-sm text-slate-600">Hesabın yok mu?</span>
              <Link
                to="/auth/register"
                className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Kayıt Ol
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
              Tekrar Hoş Geldin!
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              Yurt ihtiyaçlarını karşılamaya kaldığın yerden devam et.
            </p>
            <div className="relative rounded-3xl overflow-hidden bg-orange-500 aspect-[4/3] max-w-lg shadow-xl">
              <img
                src={banner}
                alt="Yurt Market Login"
                className="h-full w-full object-cover opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-600/20" />
            </div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="w-full max-w-md mx-auto lg:ml-auto">
            <div className="bg-white rounded-2xl p-5 shadow-lg">
              
              <div className="mb-6 text-center lg:text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Giriş Yap</p>
                <h2 className="text-xl font-bold text-slate-900 mt-1">Hesabına Eriş</h2>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                {/* Email */}
                <div>
                  <label className="text-xs font-semibold text-slate-900 mb-1 block">
                    E-posta
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="ornek@kampus.edu.tr"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  {formState.errors.email && (
                    <p className="mt-0.5 text-[10px] text-red-500">{formState.errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-900 block">
                      Şifre
                    </label>
                    <Link to="/auth/forgot-password" className="text-[10px] text-brand-600 hover:underline">
                      Şifremi unuttum
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      placeholder="••••••"
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

                {/* Server Error */}
                {serverError && (
                  <div className="rounded-lg bg-red-50 p-2 text-xs text-red-600">{serverError}</div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/30 transition-all hover:bg-brand-700 hover:shadow-lg disabled:opacity-50 mt-2"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
                </button>

                {/* Register Link (Mobile/Alt) */}
                <p className="text-[10px] text-center text-slate-500 mt-4">
                  Hesabın yok mu?{" "}
                  <Link to="/auth/register" className="text-brand-600 font-semibold hover:underline">
                    Hemen kayıt ol
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};