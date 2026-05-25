import { Link } from 'react-router-dom';
import { ShoppingBag, DollarSign, UtensilsCrossed, Store, Tag, AlertCircle, ChevronRight } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { ADMIN_PEDIDOS_MOCK } from '../data/adminPedidos.mock';
import { ADMIN_PRODUCTOS_MOCK } from '../data/adminProductos.mock';
import { ADMIN_RESTAURANTES_MOCK } from '../data/adminRestaurantes.mock';
import { ADMIN_OFERTAS_MOCK } from '../data/adminOfertas.mock';

export default function AdminDashboardPage() {
  const ventasHoy = ADMIN_PEDIDOS_MOCK.reduce((s, p) => s + p.total, 0);
  const pedidosPendientes = ADMIN_PEDIDOS_MOCK.filter((p) => p.estado === 'Pendiente').length;
  const productosActivos = ADMIN_PRODUCTOS_MOCK.filter((p) => p.activo).length;
  const restaurantesActivos = ADMIN_RESTAURANTES_MOCK.filter((r) => r.activo).length;
  const ofertasActivas = ADMIN_OFERTAS_MOCK.filter((o) => o.activo).length;

  const recentOrders = ADMIN_PEDIDOS_MOCK.slice(0, 5);
  const topProducts = ADMIN_PRODUCTOS_MOCK.filter((p) => p.esDestacado && p.activo);

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        <div>
          <p className="text-gray-500 text-sm">Bienvenida, <strong className="text-gray-700">Ana García</strong> · hoy es {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard label="Pedidos hoy" value={ADMIN_PEDIDOS_MOCK.length} icon={<ShoppingBag size={22} className="text-orange-500" />} iconBg="bg-orange-50" trend={{ value: '+12% vs ayer', positive: true }} />
          <StatCard label="Ventas hoy" value={`$${ventasHoy.toFixed(0)}`} icon={<DollarSign size={22} className="text-green-500" />} iconBg="bg-green-50" trend={{ value: '+8% vs ayer', positive: true }} />
          <StatCard label="Productos activos" value={productosActivos} icon={<UtensilsCrossed size={22} className="text-blue-500" />} iconBg="bg-blue-50" />
          <StatCard label="Restaurantes" value={restaurantesActivos} icon={<Store size={22} className="text-purple-500" />} iconBg="bg-purple-50" />
          <StatCard label="Ofertas activas" value={ofertasActivas} icon={<Tag size={22} className="text-yellow-500" />} iconBg="bg-yellow-50" />
          <StatCard label="Pendientes" value={pedidosPendientes} icon={<AlertCircle size={22} className="text-red-500" />} iconBg="bg-red-50" sub="Requieren atención" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-extrabold text-gray-900">Pedidos Recientes</h2>
              <Link to="/admin/orders" className="text-orange-500 text-sm font-medium hover:text-orange-600 flex items-center gap-1">Ver todos <ChevronRight size={14} /></Link>
            </div>
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
                    <tr key={o.id} className="border-b border-gray-50 last:border-0 hover:bg-orange-50/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{o.numeroPedido}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{o.clienteNombre}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{o.restaurante}</td>
                      <td className="px-4 py-3 font-bold text-orange-500">${o.total.toFixed(2)}</td>
                      <td className="px-4 py-3"><StatusBadge status={o.estado} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-extrabold text-gray-900">Productos Destacados</h2>
              <Link to="/admin/products" className="text-orange-500 text-sm font-medium hover:text-orange-600 flex items-center gap-1">Ver <ChevronRight size={14} /></Link>
            </div>
            <div className="p-3 space-y-2">
              {topProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <img src={p.imagen} alt={p.nombre} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{p.nombre}</p>
                    <p className="text-gray-500 text-xs">{p.categoria}</p>
                  </div>
                  <p className="font-bold text-orange-500 text-sm flex-shrink-0">${p.precioBase.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
