import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../modules/auth/context/AuthContext';
import { ShoppingBag, LogOut, User as UserIcon, Shield, ChevronDown, MapPin, CreditCard } from 'lucide-react';

export default function ClientLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user && user.roles.some((r: string) => ['Administrador', 'Supervisor', 'EmpleadoBackoffice'].includes(r));

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = (user?.nombreCompleto ?? '?')
    .split(' ')
    .map((n: string) => n[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col client-layout-shell">
      {/* Shared Unified Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm flex-shrink-0 main-unified-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 cursor-pointer select-none">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">FB</span>
              </div>
              <span className="font-black text-xl text-gray-900">
                Fast<span className="text-orange-500">Bites</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className={`font-semibold text-sm transition-colors ${
                  location.pathname === '/' ? 'text-orange-500' : 'text-gray-700 hover:text-orange-500'
                }`}
              >
                Inicio
              </Link>
              <Link
                to="/productos"
                className={`font-semibold text-sm transition-colors ${
                  location.pathname === '/productos' ? 'text-orange-500' : 'text-gray-700 hover:text-orange-500'
                }`}
              >
                Menú
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1 text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200 px-2.5 py-1 rounded-full hover:bg-orange-100 transition-colors"
                >
                  <Shield size={12} />
                  Consola Admin
                </Link>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/carrito"
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-orange-500/20"
              >
                <ShoppingBag size={16} />
                <span>Carrito</span>
              </Link>

              {user ? (
                <div ref={menuRef} className="relative border-l border-gray-100 pl-3">
                  <button
                    onClick={() => setMenuOpen((o) => !o)}
                    className="flex items-center gap-2 hover:bg-gray-50 rounded-xl px-2 py-1.5 transition-colors"
                  >
                    <div className="hidden sm:block text-right">
                      <p className="text-xs font-black text-gray-900 leading-tight">{user.nombreCompleto}</p>
                      <p className="text-[10px] font-semibold text-gray-400 capitalize">{user.roles[0] || 'Cliente'}</p>
                    </div>
                    <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 font-black text-xs">{initials}</span>
                    </div>
                    <ChevronDown
                      size={14}
                      className={`text-gray-400 transition-transform flex-shrink-0 ${menuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 py-1.5 z-50">
                      <Link
                        to="/mi-cuenta"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        <UserIcon size={15} />
                        Mi Cuenta
                      </Link>
                      <Link
                        to="/pedidos"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        <ShoppingBag size={15} />
                        Mis Pedidos
                      </Link>
                      <Link
                        to="/mis-direcciones"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        <MapPin size={15} />
                        Mis Direcciones
                      </Link>
                      <Link
                        to="/mis-metodos-pago"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        <CreditCard size={15} />
                        Métodos de Pago
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={() => { setMenuOpen(false); handleLogout(); }}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={15} />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 border border-gray-200 hover:border-orange-500 hover:text-orange-500 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 transition-colors"
                >
                  <UserIcon size={16} />
                  <span>Ingresar</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 client-page-content-area">
        <Outlet />
      </div>
    </div>
  );
}
