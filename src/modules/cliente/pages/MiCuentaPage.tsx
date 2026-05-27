import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Shield, MapPin, CreditCard, Package } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { API_BASE_URL } from '../../../config/api';

interface ClienteDetalle {
  clienteId: number;
  nombre:    string;
  apellido:  string;
  telefono:  string | null;
  fechaNacimiento: string | null;
}

export default function MiCuentaPage() {
  const { user } = useAuth();
  const [cliente, setCliente]   = useState<ClienteDetalle | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const token = localStorage.getItem('fb_token') ?? '';
    fetch(`${API_BASE_URL}/api/customers/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCliente(json.data);
        else setError(json.message ?? 'Error al cargar el perfil.');
      })
      .catch(() => setError('No se pudo conectar con el servidor.'))
      .finally(() => setLoading(false));
  }, []);

  const initials = (user?.nombreCompleto ?? '?')
    .split(' ')
    .map((n: string) => n[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">FB</span>
              </div>
              <span className="font-black text-xl text-gray-900">
                Fast<span className="text-orange-500">Bites</span>
              </span>
            </div>
            <Link
              to="/"
              className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 text-sm font-medium transition-colors"
            >
              <ArrowLeft size={15} />
              Inicio
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <User size={28} className="text-orange-500" />
          <h1 className="text-3xl font-extrabold text-gray-900">Mi Cuenta</h1>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-500 text-sm">Cargando perfil...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-6 py-4 rounded-2xl text-center mb-6">
            {error}
          </div>
        )}

        {!loading && (
          <>
            {/* Tarjeta de perfil */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-600 font-black text-xl">{initials}</span>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900 leading-tight">
                    {user?.nombreCompleto ?? '—'}
                    {cliente?.apellido ? ` ${cliente.apellido}` : ''}
                  </h2>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(user?.roles ?? []).map((r: string) => (
                      <span
                        key={r}
                        className="inline-flex items-center gap-1 text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full"
                      >
                        <Shield size={10} />
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">{user?.email ?? '—'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">{cliente?.telefono ?? 'Sin teléfono registrado'}</span>
                </div>
                {cliente?.fechaNacimiento && (
                  <div className="flex items-center gap-3 text-sm">
                    <User size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700">
                      {new Date(cliente.fechaNacimiento).toLocaleDateString('es-MX', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Accesos rápidos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { to: '/mis-direcciones',   icon: <MapPin size={20} className="text-orange-500" />,   label: 'Mis Direcciones',   sub: 'Gestionar entregas'  },
                { to: '/mis-metodos-pago',  icon: <CreditCard size={20} className="text-orange-500" />, label: 'Métodos de Pago',   sub: 'Tarjetas y efectivo' },
                { to: '/pedidos',           icon: <Package size={20} className="text-orange-500" />,   label: 'Mis Pedidos',       sub: 'Historial de órdenes'},
              ].map(({ to, icon, label, sub }) => (
                <Link
                  key={to}
                  to={to}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 p-5 flex items-center gap-3 transition-all group"
                >
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors flex-shrink-0">
                    {icon}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{label}</p>
                    <p className="text-gray-400 text-xs">{sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
