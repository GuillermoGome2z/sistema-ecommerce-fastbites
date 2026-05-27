import { useState, useEffect } from 'react';
import { Eye, Pencil, ToggleLeft, ToggleRight, Search, Loader } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import AdminTable from '../components/AdminTable';
import StatusBadge from '../components/StatusBadge';
import ActionButton from '../components/ActionButton';
import type { AdminUser } from '../types/backoffice.types';
import { API_BASE_URL } from '../../../config/api';

const ROL_COLORS: Record<string, string> = {
  Administrador: 'bg-purple-50 text-purple-700',
  Supervisor: 'bg-blue-50 text-blue-700',
  EmpleadoBackoffice: 'bg-orange-50 text-orange-700',
  Cliente: 'bg-gray-100 text-gray-600',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar usuarios desde la base de datos
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('fb_token');
        const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (json.success) {
          setUsers(json.data);
        } else {
          throw new Error(json.message || 'Error al obtener usuarios');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const toggleActive = async (id: number) => {
    try {
      const token = localStorage.getItem('fb_token');
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, activo: json.data.activo } : u))
        );
      } else {
        alert(json.message || 'No se pudo cambiar el estado del usuario');
      }
    } catch (err) {
      alert('Error de conexión al cambiar el estado');
    }
  };

  const filtered = users.filter(
    (u) =>
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.rol.toLowerCase().includes(search.toLowerCase())
  );

  const rows = filtered.map((u) => [
    <div className="flex items-center gap-3" key={`user-info-${u.id}`}>
      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
        <span className="text-orange-600 font-bold text-xs">{u.nombre.charAt(0)}</span>
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-sm">{u.nombre}</p>
        <p className="text-gray-500 text-xs">{u.email}</p>
      </div>
    </div>,
    <span key={`rol-${u.id}`} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROL_COLORS[u.rol] ?? 'bg-gray-100 text-gray-600'}`}>{u.rol}</span>,
    <StatusBadge key={`status-${u.id}`} status="" active={u.activo} />,
    <span key={`access-${u.id}`} className="text-xs text-gray-500">
      {u.ultimoAcceso ? new Date(u.ultimoAcceso).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
    </span>,
    <span key={`reg-${u.id}`} className="text-xs text-gray-500">
      {new Date(u.fechaCreacion).toLocaleDateString('es-MX')}
    </span>,
    <div className="flex items-center gap-1" key={`actions-${u.id}`}>
      <ActionButton onClick={() => {}} icon={<Eye size={15} />} label="Ver usuario" />
      <ActionButton onClick={() => {}} icon={<Pencil size={15} />} label="Editar usuario" />
      <ActionButton
        onClick={() => toggleActive(u.id)}
        icon={u.activo ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
        label={u.activo ? 'Desactivar' : 'Activar'}
        variant={u.activo ? 'warning' : 'success'}
      />
    </div>,
  ]);

  return (
    <AdminLayout title="Usuarios">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            {loading ? 'Cargando usuarios...' : `${users.length} usuarios registrados en la base de datos`}
          </p>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 w-full sm:w-64">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre, email o rol..." className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none w-full" />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
            Ocurrió un error al cargar los usuarios: {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-10 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <Loader className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : (
          <AdminTable
            headers={['Usuario', 'Rol', 'Estado', 'Último acceso', 'Registro', 'Acciones']}
            rows={rows}
            emptyMessage="No se encontraron usuarios"
          />
        )}
      </div>
    </AdminLayout>
  );
}
