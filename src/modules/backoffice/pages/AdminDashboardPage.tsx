import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, DollarSign, UtensilsCrossed, Store, Tag, AlertCircle, ChevronRight, Loader } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../../auth/context/AuthContext';
import { API_BASE_URL } from '../../../config/api';

interface AdminOrder {
  pedidoId:          number;
  nombreCliente:     string;
  estado:            string;
  fechaPedido:       string;
  total:             number;
  nombreRestaurante: string;
  totalItems:        number;
}

interface BackendProduct {
  ProductoId:   number;
  Nombre:       string;
  Descripcion:  string;
  PrecioBase:   number;
  Categoria:    string;
  Restaurante:  string;
  EsDestacado:  boolean;
  Activo:       boolean;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function numeroPedido(o: AdminOrder) {
  const d = new Date(o.fechaPedido).toISOString().slice(0, 10).replace(/-/g, '');
  return `FB-${d}-${String(o.pedidoId).padStart(3, '0')}`;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders]     = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const token = localStorage.getItem('fb_token') ?? '';
    const headers: HeadersInit = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API_BASE_URL}/api/admin/orders`, { headers }).then((r) => r.json()),
      fetch(`${API_BASE_URL}/api/products`).then((r) => r.json()),
    ])
      .then(([ordersJson, productsJson]) => {
        if (ordersJson.success)   setOrders(ordersJson.data as AdminOrder[]);
        else setError(ordersJson.message ?? 'Error al cargar pedidos.');
        if (productsJson.success) setProducts(productsJson.data as BackendProduct[]);
      })
      .catch(() => setError('No se pudo conectar con el servidor.'))
      .finally(() => setLoading(false));
  }, []);

  const hoy = todayStr();

  const kpis = useMemo(() => {
    const pedidosHoy     = orders.filter((o) => new Date(o.fechaPedido).toISOString().slice(0, 10) === hoy);
    const ventasHoy      = pedidosHoy.reduce((s, o) => s + o.total, 0);
    const pendientes     = orders.filter((o) => o.estado === 'Pendiente').length;
    const prodActivos    = products.filter((p) => p.Activo).length;
    const restaurantes   = new Set(orders.map((o) => o.nombreRestaurante)).size;
    return { pedidosHoy: pedidosHoy.length, ventasHoy, pendientes, prodActivos, restaurantes };
  }, [orders, products, hoy]);

  const recentOrders   = useMemo(() => orders.slice(0, 5), [orders]);
  const topProducts    = useMemo(() => products.filter((p) => p.EsDestacado && p.Activo), [products]);

  const nombre = user?.nombreCompleto?.split(' ')[0] ?? 'Administrador';

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        <div>
          <p className="text-gray-500 text-sm">
            Bienvenido, <strong className="text-gray-700">{nombre}</strong> · hoy es{' '}
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <Loader className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <StatCard
                label="Pedidos hoy"
                value={kpis.pedidosHoy}
                icon={<ShoppingBag size={22} className="text-orange-500" />}
                iconBg="bg-orange-50"
              />
              <StatCard
                label="Ventas hoy"
                value={`$${kpis.ventasHoy.toFixed(0)}`}
                icon={<DollarSign size={22} className="text-green-500" />}
                iconBg="bg-green-50"
              />
              <StatCard
                label="Productos activos"
                value={kpis.prodActivos}
                icon={<UtensilsCrossed size={22} className="text-blue-500" />}
                iconBg="bg-blue-50"
              />
              <StatCard
                label="Restaurantes"
                value={kpis.restaurantes}
                icon={<Store size={22} className="text-purple-500" />}
                iconBg="bg-purple-50"
              />
              <StatCard
                label="Ofertas activas"
                value="—"
                icon={<Tag size={22} className="text-yellow-500" />}
                iconBg="bg-yellow-50"
                sub="Próximamente"
              />
              <StatCard
                label="Pendientes"
                value={kpis.pendientes}
                icon={<AlertCircle size={22} className="text-red-500" />}
                iconBg="bg-red-50"
                sub={kpis.pendientes > 0 ? 'Requieren atención' : undefined}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Pedidos recientes */}
              <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h2 className="font-extrabold text-gray-900">Pedidos Recientes</h2>
                  <Link to="/admin/orders" className="text-orange-500 text-sm font-medium hover:text-orange-600 flex items-center gap-1">
                    Ver todos <ChevronRight size={14} />
                  </Link>
                </div>
                {recentOrders.length === 0 ? (
                  <div className="px-5 py-10 text-center text-gray-400 text-sm">No hay pedidos registrados.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          {['Pedido', 'Cliente', 'Restaurante', 'Total', 'Estado'].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((o) => (
                          <tr key={o.pedidoId} className="border-b border-gray-50 last:border-0 hover:bg-orange-50/30 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs text-gray-600">{numeroPedido(o)}</td>
                            <td className="px-4 py-3 font-medium text-gray-800">{o.nombreCliente}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs">{o.nombreRestaurante}</td>
                            <td className="px-4 py-3 font-bold text-orange-500">${o.total.toFixed(2)}</td>
                            <td className="px-4 py-3"><StatusBadge status={o.estado} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Productos destacados */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h2 className="font-extrabold text-gray-900">Productos Destacados</h2>
                  <Link to="/admin/products" className="text-orange-500 text-sm font-medium hover:text-orange-600 flex items-center gap-1">
                    Ver <ChevronRight size={14} />
                  </Link>
                </div>
                {topProducts.length === 0 ? (
                  <div className="px-5 py-10 text-center text-gray-400 text-sm">No hay productos destacados.</div>
                ) : (
                  <div className="p-3 space-y-2">
                    {topProducts.map((p) => (
                      <div key={p.ProductoId} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <UtensilsCrossed size={16} className="text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">{p.Nombre}</p>
                          <p className="text-gray-500 text-xs">{p.Categoria}</p>
                        </div>
                        <p className="font-bold text-orange-500 text-sm flex-shrink-0">${Number(p.PrecioBase).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
