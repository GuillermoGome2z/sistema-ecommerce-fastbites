import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import {
  LayoutDashboard, Users, Shield, Store, UtensilsCrossed,
  Clock, Tag, ShoppingBag, X, ArrowLeft, BarChart2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
  end?: boolean;
  allowedRoles: string[];
}

const ALL_ADMIN = ['Administrador', 'EmpleadoBackoffice', 'Supervisor'];

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',    icon: LayoutDashboard, path: '/admin',             end: true, allowedRoles: ALL_ADMIN },
  { label: 'Usuarios',     icon: Users,           path: '/admin/users',                 allowedRoles: ['Administrador'] },
  { label: 'Roles',        icon: Shield,          path: '/admin/roles',                 allowedRoles: ['Administrador'] },
  { label: 'Restaurantes', icon: Store,           path: '/admin/restaurants',           allowedRoles: ALL_ADMIN },
  { label: 'Productos',    icon: UtensilsCrossed, path: '/admin/products',              allowedRoles: ALL_ADMIN },
  { label: 'Dayparts',     icon: Clock,           path: '/admin/dayparts',              allowedRoles: ['Administrador', 'EmpleadoBackoffice'] },
  { label: 'Ofertas',      icon: Tag,             path: '/admin/offers',                allowedRoles: ALL_ADMIN },
  { label: 'Pedidos',      icon: ShoppingBag,     path: '/admin/orders',                allowedRoles: ALL_ADMIN },
  { label: 'Reportes',     icon: BarChart2,       path: '/admin/reportes',              allowedRoles: ['Administrador', 'Supervisor'] },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ open, onClose }: Props) {
  const { user } = useAuth();
  const userRoles = user?.roles ?? [];

  const visibleItems = NAV_ITEMS.filter(item =>
    item.allowedRoles.some(r => userRoles.includes(r))
  );

  const initials = (user?.nombreCompleto ?? 'A')
    .split(' ')
    .map(n => n[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-60 bg-gray-900 text-white flex flex-col transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:flex-shrink-0`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">FB</span>
            </div>
            <div>
              <p className="font-black text-white text-base leading-none">
                Fast<span className="text-orange-400">Bites</span>
              </p>
              <p className="text-gray-500 text-xs">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => { if (window.innerWidth < 1024) onClose(); }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-orange-500/15 text-orange-400 border-l-2 border-orange-500 pl-[10px]'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-800 space-y-3">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full py-2 bg-gray-800 hover:bg-orange-500/10 hover:text-orange-400 text-gray-400 rounded-xl text-xs font-bold transition-all border border-gray-700/50"
          >
            <ArrowLeft size={14} />
            Salir a Portal Cliente
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.nombreCompleto ?? 'Usuario'}</p>
              <p className="text-gray-500 text-xs">{userRoles[0] ?? 'Admin'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
