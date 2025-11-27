import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { register as registerUser } from "../../services/auth";
import { Link, useNavigate } from "react-router-dom";
import { authStore } from "../../store/auth";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../lib/errors";
import { fetchDorms } from "../../services/dorms";
import type { Dorm } from "../../types";

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
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, watch, formState, setValue, setError: setFieldError, clearErrors } =
    useForm<RegisterForm>({
      resolver: zodResolver(schema),
      defaultValues: {
        email: "",
        password: "",
        dorm_name: "",
        dorm_address: "",
        role: "student",
        phone: "",
        iban: "",
      },
    });

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
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-600">Yurt adı</label>
            <input
              list="dorm-options"
              {...register("dorm_name")}
              className="mt-1 w-full rounded-2xl border-slate-200 text-slate-900"
              placeholder="Örn: Yıldız Kız Öğrenci Yurdu"
            />
            <datalist id="dorm-options">
              {dorms.map((dorm) => (
                <option key={dorm.id} value={dorm.name}>
                  {dorm.address}
                </option>
              ))}
            </datalist>
            {formState.errors.dorm_name && (
              <p className="mt-1 text-xs text-red-500">{formState.errors.dorm_name.message}</p>
            )}
            <p className="mt-1 text-xs text-slate-500">
              {selectedDorm
                ? selectedDorm.address || "Adres bilgisi yakında eklenecek."
                : "Yurdun listede yoksa adını yaz ve aşağıya adresini ekle."}
            </p>
          </div>
          {!selectedDorm && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-600">Yurt adresi</label>
              <textarea
                {...register("dorm_address")}
                className="mt-1 w-full rounded-2xl border-slate-200 text-slate-900"
                placeholder="Yurdun açık adresi"
                rows={3}
              />
              {formState.errors.dorm_address && (
                <p className="mt-1 text-xs text-red-500">{formState.errors.dorm_address.message}</p>
              )}
            </div>
          )}
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
          {serverError && (
            <p className="md:col-span-2 rounded-2xl bg-red-50 p-3 text-sm text-red-600">
              {serverError}
            </p>
          )}
          <button
            type="submit"
            className="md:col-span-2 rounded-2xl bg-brand-600 py-3 font-semibold text-white shadow-lg shadow-brand-500/30"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Kaydediliyor..." : "Kaydı tamamla"}
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

