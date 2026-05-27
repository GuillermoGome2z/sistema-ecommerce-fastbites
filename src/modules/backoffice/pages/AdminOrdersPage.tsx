import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import AdminTable from '../components/AdminTable';
import StatusBadge from '../components/StatusBadge';
import ActionButton from '../components/ActionButton';
import OrderDetailDrawer from '../components/OrderDetailDrawer';
import type { AdminOrder, AdminOrderStatus } from '../types/backoffice.types';
import { API_BASE_URL } from '../../../config/api';

// ── Backend shapes ────────────────────────────────────────────────
interface BackendListItem {
  pedidoId: number;
  nombreCliente: string;
  estado: string;
  tipoEntrega: string;
  fechaPedido: string;
  total: number;
  nombreRestaurante: string;
}

interface BackendDetalle {
  pedidoId: number;
  nombreCliente: string;
  estado: string;
  tipoEntrega: string;
  fechaPedido: string;
  restaurante: { nombre: string };
  direccion: { calle: string; ciudad: string } | null;
  totales: { subtotal: number; descuento: number; costoEnvio: number; total: number };
  pago: { tipoPago: string | null } | null;
  items: Array<{
    nombreProducto: string;
    cantidad: number;
    precioUnitario: number;
    subtotalItem: number;
    nombreTamanio: string | null;
    notas: string | null;
  }>;
}

// ── Adapters ─────────────────────────────────────────────────────
function adaptarLista(p: BackendListItem): AdminOrder {
  const fecha  = new Date(p.fechaPedido);
  const dateStr = fecha.toISOString().slice(0, 10).replace(/-/g, '');
  return {
    id:               String(p.pedidoId),
    numeroPedido:     `FB-${dateStr}-${String(p.pedidoId).padStart(3, '0')}`,
    clienteNombre:    p.nombreCliente,
    clienteEmail:     '',
    restaurante:      p.nombreRestaurante,
    fecha:            p.fechaPedido,
    estado:           p.estado as AdminOrderStatus,
    items:            [],
    subtotal:         0,
    descuento:        0,
    envio:            0,
    total:            Number(p.total),
    metodoPago:       '',
    direccionEntrega: '',
  };
}

function adaptarDetalle(d: BackendDetalle): Partial<AdminOrder> {
  return {
    estado:           d.estado as AdminOrderStatus,
    restaurante:      d.restaurante.nombre,
    subtotal:         d.totales.subtotal,
    descuento:        d.totales.descuento,
    envio:            d.totales.costoEnvio,
    total:            d.totales.total,
    metodoPago:       d.pago?.tipoPago ?? 'N/A',
    direccionEntrega: d.direccion
      ? `${d.direccion.calle}, ${d.direccion.ciudad}`
      : (d.tipoEntrega === 'Recoger' ? 'Recoger en tienda' : '—'),
    items: d.items.map((i) => ({
      nombre:          i.nombreProducto,
      cantidad:        i.cantidad,
      precioUnitario:  i.precioUnitario,
      subtotal:        i.subtotalItem,
      personalizacion: (i.nombreTamanio || i.notas)
        ? { tamano: i.nombreTamanio ?? undefined, notas: i.notas ?? undefined }
        : undefined,
    })),
  };
}

// ── Constants ─────────────────────────────────────────────────────
const ESTADOS: (AdminOrderStatus | 'Todos')[] = [
  'Todos', 'Pendiente', 'Confirmado', 'EnPreparacion', 'EnCamino', 'Entregado', 'Cancelado',
];
const ESTADO_LABELS: Record<string, string> = {
  Todos: 'Todos', Pendiente: 'Pendiente', Confirmado: 'Confirmado',
  EnPreparacion: 'Preparando', EnCamino: 'En camino', Entregado: 'Entregado', Cancelado: 'Cancelado',
};

// ── Page ──────────────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders]           = useState<AdminOrder[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [estadoFilter, setEstadoFilter] = useState<AdminOrderStatus | 'Todos'>('Todos');
  const [drawerOrder, setDrawerOrder] = useState<AdminOrder | null>(null);

  const getHeaders = () => ({
    Authorization:  `Bearer ${localStorage.getItem('fb_token') ?? ''}`,
    'Content-Type': 'application/json',
  });

  // Carga inicial
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/orders`, { headers: getHeaders() })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setOrders(json.data.map(adaptarLista));
        else setError(json.message ?? 'Error al cargar pedidos');
      })
      .catch(() => setError('No se pudo conectar con el servidor.'))
      .finally(() => setLoading(false));
  }, []);

  // Abre drawer y carga el detalle completo
  const openDrawer = (o: AdminOrder) => {
    setDrawerOrder(o);
    fetch(`${API_BASE_URL}/api/admin/orders/${o.id}`, { headers: getHeaders() })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setDrawerOrder((prev) => prev ? { ...prev, ...adaptarDetalle(json.data) } : null);
        }
      })
      .catch(() => {});
  };

  // Cambia estado en backend y actualiza local
  const handleStatusChange = (id: string, status: AdminOrderStatus) => {
    fetch(`${API_BASE_URL}/api/admin/orders/${id}/status`, {
      method:  'PATCH',
      headers: getHeaders(),
      body:    JSON.stringify({ estado: status }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setOrders((prev) => prev.map((o) => o.id === id ? { ...o, estado: status } : o));
          setDrawerOrder((prev) => prev ? { ...prev, estado: status } : null);
        }
      })
      .catch(() => {});
  };

  const filtered = estadoFilter === 'Todos'
    ? orders
    : orders.filter((o) => o.estado === estadoFilter);

  if (loading) {
    return (
      <AdminLayout title="Pedidos">
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500 text-sm">Cargando pedidos...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Pedidos">
        <div className="flex items-center justify-center py-20">
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-6 py-4 rounded-2xl max-w-md text-center">
            {error}
          </div>
        </div>
      </AdminLayout>
    );
  }

  const rows = filtered.map((o) => [
    <span className="font-mono text-xs text-gray-600">{o.numeroPedido}</span>,
    <p className="font-semibold text-gray-900 text-sm">{o.clienteNombre}</p>,
    <span className="text-xs text-gray-600">{o.restaurante}</span>,
    <span className="text-xs text-gray-500">
      {new Date(o.fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
    </span>,
    <StatusBadge status={o.estado} />,
    <span className="font-bold text-orange-500">${o.total.toFixed(2)}</span>,
    <span className="text-xs text-gray-500">{o.metodoPago || '—'}</span>,
    <ActionButton
      onClick={() => openDrawer(o)}
      icon={<Eye size={15} />}
      label="Ver detalle"
      variant="default"
    />,
  ]);

  return (
    <AdminLayout title="Pedidos">
      <div className="space-y-5">
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
