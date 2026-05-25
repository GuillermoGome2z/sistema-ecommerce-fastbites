import { Shield, Check } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import StatusBadge from '../components/StatusBadge';
import { ADMIN_ROLES_MOCK } from '../data/adminRoles.mock';
import { ADMIN_USUARIOS_MOCK } from '../data/adminUsuarios.mock';

const ROL_COLORS: Record<string, { bg: string; icon: string; border: string }> = {
  Administrador:    { bg: 'bg-purple-50', icon: 'text-purple-500', border: 'border-purple-200' },
  Supervisor:       { bg: 'bg-blue-50',   icon: 'text-blue-500',   border: 'border-blue-200' },
  EmpleadoBackoffice: { bg: 'bg-orange-50', icon: 'text-orange-500', border: 'border-orange-200' },
  Cliente:          { bg: 'bg-gray-50',   icon: 'text-gray-500',   border: 'border-gray-200' },
};

export default function AdminRolesPage() {
  return (
    <AdminLayout title="Roles y Permisos">
      <div className="space-y-5">
        <p className="text-gray-500 text-sm">
          {ADMIN_ROLES_MOCK.length} roles configurados en el sistema.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ADMIN_ROLES_MOCK.map((role) => {
            const config = ROL_COLORS[role.nombre] ?? ROL_COLORS.Cliente;
            const usersWithRole = ADMIN_USUARIOS_MOCK.filter((u) => u.rol === role.nombre).length;

            return (
              <div key={role.id} className={`bg-white rounded-2xl shadow-sm border ${config.border} p-5 space-y-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                      <Shield size={20} className={config.icon} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-900">{role.nombre}</h3>
                      <p className="text-gray-400 text-xs mt-0.5">{usersWithRole} {usersWithRole === 1 ? 'usuario' : 'usuarios'}</p>
                    </div>
                  </div>
                  <StatusBadge status="" active={role.activo} />
                </div>

                <p className="text-gray-600 text-sm leading-relaxed">{role.descripcion}</p>

                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Permisos</p>
                  <div className="flex flex-wrap gap-2">
                    {role.permisos.map((p) => (
                      <span key={p} className="flex items-center gap-1 text-xs bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-lg">
                        <Check size={10} className="text-green-500 flex-shrink-0" />
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
