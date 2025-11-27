import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { register as registerUser } from "../../services/auth";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { authStore } from "../../store/auth";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "../../lib/errors";

const schema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(6, "Şifre en az 6 karakter"),
  dorm_id: z.coerce.number().int().positive("Yurt ID girin"),
  role: z.enum(["student", "seller"]),
  phone: z.string().optional(),
  iban: z.string().optional(),
});

type RegisterForm = z.infer<typeof schema>;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, watch, formState } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      dorm_id: 1,
      role: "student",
      phone: "",
      iban: "",
    },
  });

  const role = watch("role");

  const mutation = useMutation({
    mutationFn: (payload: RegisterForm) => registerUser(payload),
    onSuccess: () => {
      setError(null);
      toast.success("Hesabın oluşturuldu!");
      const role = authStore.getState().user?.role;
      navigate(role === "seller" ? "/seller/products" : "/app/explore");
    },
    onError: (err: any) => {
      const message = getErrorMessage(err, "Kayıt sırasında hata oluştu");
      setError(message);
      toast.error(message);
    },
  });

  const onSubmit = (data: RegisterForm) => mutation.mutate(data);

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 px-4">
      <div className="mx-auto w-full max-w-xl rounded-3xl bg-white p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
          Kaydol
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Yurt Market'e katıl</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-600">E-posta</label>
            <input
              type="email"
              {...register("email")}
              className="mt-1 w-full rounded-2xl border-slate-200 text-slate-900"
            />
            {formState.errors.email && (
              <p className="mt-1 text-xs text-red-500">{formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Şifre</label>
            <input
              type="password"
              {...register("password")}
              className="mt-1 w-full rounded-2xl border-slate-200 text-slate-900"
            />
            {formState.errors.password && (
              <p className="mt-1 text-xs text-red-500">{formState.errors.password.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Yurt ID</label>
            <input
              type="number"
              {...register("dorm_id")}
              className="mt-1 w-full rounded-2xl border-slate-200 text-slate-900"
            />
            {formState.errors.dorm_id && (
              <p className="mt-1 text-xs text-red-500">{formState.errors.dorm_id.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Rol</label>
            <select
              {...register("role")}
              className="mt-1 w-full rounded-2xl border-slate-200 text-slate-900"
            >
              <option value="student">Öğrenci</option>
              <option value="seller">Satıcı</option>
            </select>
          </div>
          {role === "seller" && (
            <>
              <div>
                <label className="text-sm font-medium text-slate-600">Telefon</label>
                <input
                  type="tel"
                  {...register("phone")}
                  className="mt-1 w-full rounded-2xl border-slate-200 text-slate-900"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">IBAN</label>
                <input
                  type="text"
                  {...register("iban")}
                  className="mt-1 w-full rounded-2xl border-slate-200 text-slate-900"
                />
              </div>
            </>
          )}
          {error && (
            <p className="md:col-span-2 rounded-2xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="md:col-span-2 rounded-2xl bg-brand-600 py-3 font-semibold text-white shadow-lg shadow-brand-500/30"
          >
            {mutation.isLoading ? "Kaydediliyor..." : "Kaydı tamamla"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Zaten hesabın var mı?{" "}
          <Link to="/auth/login" className="font-semibold text-brand-600">
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  );
};

