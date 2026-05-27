import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';

interface Props {
  title: string;
  onMenuToggle: () => void;
}

export default function AdminHeader({ title, onMenuToggle }: Props) {
  const { user } = useAuth();
  const initials = (user?.nombreCompleto ?? 'A')
    .split(' ')
    .map((n) => n[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="bg-white border-b border-gray-100 px-4 sm:px-6 h-16 flex items-center justify-between gap-4 flex-shrink-0 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors lg:hidden"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-extrabold text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 w-48">
          <Search size={14} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Buscar..."
            className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none w-full"
          />
        </div>

        <button className="relative p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
        </button>

        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
          {initials}
        </div>
      </div>
    </header>
  );
}
