import { useState } from 'react';
import { Eye, Pencil, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import AdminTable from '../components/AdminTable';
import StatusBadge from '../components/StatusBadge';
import ActionButton from '../components/ActionButton';
import { ADMIN_USUARIOS_MOCK } from '../data/adminUsuarios.mock';
import type { AdminUser } from '../types/backoffice.types';

const ROL_COLORS: Record<string, string> = {
  Administrador: 'bg-purple-50 text-purple-700',
  Supervisor: 'bg-blue-50 text-blue-700',
  EmpleadoBackoffice: 'bg-orange-50 text-orange-700',
  Cliente: 'bg-gray-100 text-gray-600',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(ADMIN_USUARIOS_MOCK);
  const [search, setSearch] = useState('');

  const filtered = users.filter(
    (u) =>
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.rol.toLowerCase().includes(search.toLowerCase())
  );

  const toggleActive = (id: number) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, activo: !u.activo } : u)));

  const rows = filtered.map((u) => [
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
        <span className="text-orange-600 font-bold text-xs">{u.nombre.charAt(0)}</span>
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-sm">{u.nombre}</p>
        <p className="text-gray-500 text-xs">{u.email}</p>
      </div>
    </div>,
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROL_COLORS[u.rol] ?? 'bg-gray-100 text-gray-600'}`}>{u.rol}</span>,
    <StatusBadge status="" active={u.activo} />,
    <span className="text-xs text-gray-500">{u.ultimoAcceso ?? '—'}</span>,
    <span className="text-xs text-gray-500">{u.fechaCreacion}</span>,
    <div className="flex items-center gap-1">
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
          <p className="text-gray-500 text-sm">{users.length} usuarios registrados</p>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 w-full sm:w-64">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre, email o rol..." className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none w-full" />
          </div>
        </div>

        <AdminTable
          headers={['Usuario', 'Rol', 'Estado', 'Último acceso', 'Registro', 'Acciones']}
          rows={rows}
          emptyMessage="No se encontraron usuarios"
        />
      </div>
    </AdminLayout>
  );
}
