import { useQuery } from "@tanstack/react-query";
import { fetchAdminUsers } from "../../services/admin";
import { Spinner } from "../../components/ui/Spinner";
import { User as UserType } from "../../types";
import dayjs from "dayjs";
import "dayjs/locale/tr";

dayjs.locale("tr");

const getRoleBadge = (role: string) => {
  switch (role) {
    case "seller":
      return "bg-blue-100 text-blue-700";
    case "student":
      return "bg-green-100 text-green-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

export const AdminUsersPage = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAdminUsers,
  });

  if (isLoading) return <Spinner label="Kullanıcılar yükleniyor..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Kullanıcılar</h1>
        <p className="text-sm text-slate-600">Toplam {users?.length || 0} kullanıcı</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">E-posta</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">Yurt</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">Kayıt Tarihi</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-600">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users && users.length > 0 ? (
              users.map((user: UserType) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadge(user.role)}`}>
                      {user.role === "seller" ? "Satıcı" : "Öğrenci"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.dorm_id}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {user.date_joined ? dayjs(user.date_joined).format("DD.MM.YYYY") : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    {user.is_staff || user.is_superuser ? (
                      <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                        Admin
                      </span>
                    ) : (
                      <span className="text-sm text-slate-500">Aktif</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                  Henüz kullanıcı yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

