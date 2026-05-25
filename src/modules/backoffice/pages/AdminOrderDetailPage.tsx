import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, Store, Check } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import StatusBadge from '../components/StatusBadge';
import { ADMIN_PEDIDOS_MOCK } from '../data/adminPedidos.mock';
import type { AdminOrderStatus } from '../types/backoffice.types';

const STATUS_FLOW: AdminOrderStatus[] = ['Pendiente', 'Confirmado', 'EnPreparacion', 'EnCamino', 'Entregado'];
const STATUS_LABELS: Record<AdminOrderStatus, string> = {
  Pendiente: 'Pendiente', Confirmado: 'Confirmado', EnPreparacion: 'En Preparación',
  EnCamino: 'En Camino', Entregado: 'Entregado', Cancelado: 'Cancelado',
};
const STATUS_EMOJIS: Record<AdminOrderStatus, string> = {
  Pendiente: '🕐', Confirmado: '✅', EnPreparacion: '👨‍🍳', EnCamino: '🛵', Entregado: '🏠', Cancelado: '❌',
};

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const found = ADMIN_PEDIDOS_MOCK.find((o) => o.id === id);
  const [order, setOrder] = useState(found ?? null);

  if (!order) {
    return (
      <AdminLayout title="Pedido no encontrado">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-xl font-extrabold text-gray-800 mb-2">Pedido no encontrado</p>
          <button onClick={() => navigate('/admin/orders')} className="mt-4 text-orange-500 font-semibold hover:text-orange-600 transition-colors">← Volver a pedidos</button>
        </div>
      </AdminLayout>
    );
  }

  const currentIdx = STATUS_FLOW.indexOf(order.estado as AdminOrderStatus);
  const isCancelled = order.estado === 'Cancelado';

  const changeStatus = (status: AdminOrderStatus) =>
    setOrder((prev) => prev ? { ...prev, estado: status } : null);

  return (
    <AdminLayout title={`Pedido #${order.numeroPedido}`}>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/orders')} className="flex items-center gap-1.5 text-gray-500 hover:text-orange-500 text-sm font-medium transition-colors">
            <ArrowLeft size={15} /> Volver
          </button>
          <span className="text-gray-400">·</span>
          <span className="text-sm text-gray-500">{new Date(order.fecha).toLocaleString('es-MX')}</span>
          <StatusBadge status={order.estado} />
        </div>

        {/* Timeline */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-extrabold text-gray-900 mb-5">Progreso del pedido</h2>
            <div className="flex items-center">
              {STATUS_FLOW.map((status, i) => {
                const isDone = i <= currentIdx;
                const isActive = i === currentIdx;
                return (
                  <div key={status} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base transition-all ${
                        isDone ? (isActive ? 'bg-orange-500 shadow-lg shadow-orange-200' : 'bg-orange-500') : 'bg-gray-100'
                      }`}>
                        {isDone ? (isActive ? STATUS_EMOJIS[status] : <Check size={16} className="text-white" strokeWidth={3} />) : STATUS_EMOJIS[status]}
                      </div>
                      <span className={`text-xs font-medium hidden sm:block text-center leading-tight ${isActive ? 'text-orange-500' : isDone ? 'text-gray-600' : 'text-gray-400'}`}>
                        {STATUS_LABELS[status]}
                      </span>
                    </div>
                    {i < STATUS_FLOW.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-1 mb-5 transition-all ${i < currentIdx ? 'bg-orange-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-extrabold text-gray-900 mb-4">Productos</h2>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-semibold text-gray-900">{item.nombre}</p>
                      <p className="text-gray-400 text-sm">x{item.cantidad} · ${item.precioUnitario.toFixed(2)} c/u</p>
                      {item.personalizacion && (
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          {item.personalizacion.tamano && <span className="text-xs bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full">{item.personalizacion.tamano}</span>}
                          {item.personalizacion.bebida && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">🥤 {item.personalizacion.bebida}</span>}
                          {item.personalizacion.notas && <span className="text-xs bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full italic">"{item.personalizacion.notas}"</span>}
                        </div>
                      )}
                    </div>
                    <p className="font-bold text-gray-900">${item.subtotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-dashed border-gray-200 space-y-1.5">
                <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
                {order.descuento > 0 && <div className="flex justify-between text-sm text-green-600"><span>Descuento</span><span>−${order.descuento.toFixed(2)}</span></div>}
                <div className="flex justify-between text-sm text-gray-600"><span>Envío</span><span>{order.envio === 0 ? 'Gratis' : `$${order.envio.toFixed(2)}`}</span></div>
                <div className="flex justify-between font-extrabold text-gray-900 text-lg border-t border-gray-100 pt-2 mt-1"><span>Total</span><span className="text-orange-500">${order.total.toFixed(2)}</span></div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">Información</h3>
              <div className="flex gap-2.5 text-sm"><MapPin size={14} className="text-orange-400 mt-0.5 flex-shrink-0" /><div><p className="text-xs text-gray-400 mb-0.5">Entrega en</p><p className="text-gray-700">{order.direccionEntrega}</p></div></div>
              <div className="flex gap-2.5 text-sm"><CreditCard size={14} className="text-orange-400 mt-0.5 flex-shrink-0" /><div><p className="text-xs text-gray-400 mb-0.5">Método de pago</p><p className="text-gray-700">{order.metodoPago}</p></div></div>
              <div className="flex gap-2.5 text-sm"><Store size={14} className="text-orange-400 mt-0.5 flex-shrink-0" /><div><p className="text-xs text-gray-400 mb-0.5">Restaurante</p><p className="text-gray-700">{order.restaurante}</p></div></div>
              <div className="border-t border-gray-100 pt-3"><p className="text-xs text-gray-400 mb-0.5">Cliente</p><p className="font-semibold text-gray-800 text-sm">{order.clienteNombre}</p><p className="text-gray-400 text-xs">{order.clienteEmail}</p></div>
            </div>

            {!isCancelled && order.estado !== 'Entregado' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2">
                <h3 className="font-bold text-gray-900 text-sm mb-3">Cambiar estado</h3>
                {STATUS_FLOW.filter((_, i) => i > currentIdx).map((s) => (
                  <button key={s} onClick={() => changeStatus(s)} className="w-full py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition-colors">
                    → {STATUS_LABELS[s]}
                  </button>
                ))}
                <button onClick={() => changeStatus('Cancelado')} className="w-full py-2 rounded-xl text-xs font-bold border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition-colors">
                  Cancelar pedido
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
