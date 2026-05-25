import { useState } from 'react';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import AdminTable from '../components/AdminTable';
import StatusBadge from '../components/StatusBadge';
import ActionButton from '../components/ActionButton';
import OrderDetailDrawer from '../components/OrderDetailDrawer';
import { ADMIN_PEDIDOS_MOCK } from '../data/adminPedidos.mock';
import type { AdminOrder, AdminOrderStatus } from '../types/backoffice.types';

const ESTADOS: (AdminOrderStatus | 'Todos')[] = ['Todos', 'Pendiente', 'Confirmado', 'EnPreparacion', 'EnCamino', 'Entregado', 'Cancelado'];
const ESTADO_LABELS: Record<string, string> = {
  Todos: 'Todos', Pendiente: 'Pendiente', Confirmado: 'Confirmado',
  EnPreparacion: 'Preparando', EnCamino: 'En camino', Entregado: 'Entregado', Cancelado: 'Cancelado',
};

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<AdminOrder[]>(ADMIN_PEDIDOS_MOCK);
  const [estadoFilter, setEstadoFilter] = useState<AdminOrderStatus | 'Todos'>('Todos');
  const [drawerOrder, setDrawerOrder] = useState<AdminOrder | null>(null);

  const filtered = estadoFilter === 'Todos' ? orders : orders.filter((o) => o.estado === estadoFilter);

  const handleStatusChange = (id: string, status: AdminOrderStatus) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, estado: status } : o));
    setDrawerOrder((prev) => prev ? { ...prev, estado: status } : null);
  };

  const rows = filtered.map((o) => [
    <span className="font-mono text-xs text-gray-600">{o.numeroPedido}</span>,
    <div>
      <p className="font-semibold text-gray-900 text-sm">{o.clienteNombre}</p>
      <p className="text-gray-400 text-xs">{o.clienteEmail}</p>
    </div>,
    <span className="text-xs text-gray-600">{o.restaurante}</span>,
    <span className="text-xs text-gray-500">{new Date(o.fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}</span>,
    <StatusBadge status={o.estado} />,
    <span className="font-bold text-orange-500">${o.total.toFixed(2)}</span>,
    <span className="text-xs text-gray-500">{o.metodoPago}</span>,
    <ActionButton
      onClick={() => { setDrawerOrder(o); }}
      icon={<Eye size={15} />}
      label="Ver detalle"
      variant="default"
    />,
  ]);

  return (
    <AdminLayout title="Pedidos">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {ESTADOS.map((e) => (
              <button
                key={e}
                onClick={() => setEstadoFilter(e)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  estadoFilter === e
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500'
                }`}
              >
                {ESTADO_LABELS[e]}
                <span className="ml-1.5 opacity-70">
                  ({e === 'Todos' ? orders.length : orders.filter((o) => o.estado === e).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        <AdminTable
          headers={['N° Pedido', 'Cliente', 'Restaurante', 'Fecha', 'Estado', 'Total', 'Pago', 'Acción']}
          rows={rows}
          emptyMessage="No hay pedidos con este estado"
          onRowClick={(i) => navigate(`/admin/orders/${filtered[i].id}`)}
        />
      </div>

      <OrderDetailDrawer
        open={!!drawerOrder}
        onClose={() => setDrawerOrder(null)}
        order={drawerOrder}
        onStatusChange={(s) => drawerOrder && handleStatusChange(drawerOrder.id, s)}
      />
    </AdminLayout>
  );
}
