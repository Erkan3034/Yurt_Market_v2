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

const schema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

type LoginForm = z.infer<typeof schema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

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
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 px-4">
      <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Giriş yap</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Hesabına eriş</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-600">E-posta</label>
            <input
              type="email"
              {...register("email")}
              className="mt-1 w-full rounded-2xl border-slate-200 text-slate-900"
              placeholder="ornek@kampus.edu.tr"
            />
            {formState.errors.email && (
              <p className="mt-1 text-xs text-red-500">{formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-600">Şifre</label>
              <button type="button" className="text-xs text-brand-600">
                Şifremi unuttum
              </button>
            </div>
            <input
              type="password"
              {...register("password")}
              className="mt-1 w-full rounded-2xl border-slate-200 text-slate-900"
              placeholder="••••••"
            />
            {formState.errors.password && (
              <p className="mt-1 text-xs text-red-500">{formState.errors.password.message}</p>
            )}
          </div>
          {serverError && <p className="text-sm text-red-500">{serverError}</p>}
          <button
            type="submit"
            className="w-full rounded-2xl bg-brand-600 py-3 font-semibold text-white shadow-lg shadow-brand-500/30"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Giriş yapılıyor..." : "Giriş yap"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Hesabın yok mu?{" "}
          <Link to="/auth/register" className="font-semibold text-brand-600">
            Hemen kayıt ol
          </Link>
        </p>
      </div>
    </div>
  );
};

