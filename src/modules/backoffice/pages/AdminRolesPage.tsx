import { useState, useEffect, useCallback } from 'react';
import { Shield, Check, Loader } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import StatusBadge from '../components/StatusBadge';
import type { AdminRole, AdminRoleName } from '../types/backoffice.types';
import { API_BASE_URL } from '../../../config/api';

const ROL_COLORS: Record<string, { bg: string; icon: string; border: string }> = {
  Administrador:      { bg: 'bg-purple-50', icon: 'text-purple-500', border: 'border-purple-200' },
  Supervisor:         { bg: 'bg-blue-50',   icon: 'text-blue-500',   border: 'border-blue-200' },
  EmpleadoBackoffice: { bg: 'bg-orange-50', icon: 'text-orange-500', border: 'border-orange-200' },
  Cliente:            { bg: 'bg-gray-50',   icon: 'text-gray-500',   border: 'border-gray-200' },
};

const ROL_PERMISOS: Record<string, string[]> = {
  Administrador:      ['Gestionar usuarios', 'Gestionar roles', 'Gestionar restaurantes', 'Gestionar productos', 'Gestionar pedidos', 'Ver reportes', 'Gestionar ofertas', 'Configuración del sistema'],
  Supervisor:         ['Gestionar productos', 'Gestionar pedidos', 'Ver reportes', 'Gestionar ofertas'],
  EmpleadoBackoffice: ['Ver pedidos', 'Actualizar estado de pedidos', 'Ver productos'],
  Cliente:            ['Realizar pedidos', 'Ver historial de pedidos', 'Gestionar perfil', 'Ver catálogo'],
};

interface BackendRole {
  id: number;
  nombre: AdminRoleName;
  descripcion: string;
  activo: boolean;
  usuariosCount: number;
}

export default function AdminRolesPage() {
  const [roles, setRoles]     = useState<(AdminRole & { usuariosCount: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('fb_token') ?? '';
      const res  = await fetch(`${API_BASE_URL}/api/admin/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        const enriched = (json.data as BackendRole[]).map((r) => ({
          id:            r.id,
          nombre:        r.nombre,
          descripcion:   r.descripcion,
          activo:        r.activo,
          permisos:      ROL_PERMISOS[r.nombre] ?? [],
          usuariosCount: r.usuariosCount,
        }));
        setRoles(enriched);
      } else {
        setError(json.message ?? 'Error al cargar roles.');
      }
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <AdminLayout title="Roles y Permisos">
      <div className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <Loader className="w-7 h-7 text-orange-500 animate-spin" />
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm">{roles.length} roles configurados en el sistema.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {roles.map((role) => {
                const config = ROL_COLORS[role.nombre] ?? ROL_COLORS.Cliente;
                return (
                  <div key={role.id} className={`bg-white rounded-2xl shadow-sm border ${config.border} p-5 space-y-4`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                          <Shield size={20} className={config.icon} />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-gray-900">{role.nombre}</h3>
                          <p className="text-gray-400 text-xs mt-0.5">
                            {role.usuariosCount} {role.usuariosCount === 1 ? 'usuario' : 'usuarios'}
                          </p>
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
          </>
        )}
      </div>
    </AdminLayout>
  );
}
