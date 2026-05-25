import { X, MapPin, CreditCard, Clock } from 'lucide-react';
import type { AdminOrder, AdminOrderStatus } from '../types/backoffice.types';
import StatusBadge from './StatusBadge';

interface Props {
  open: boolean;
  onClose: () => void;
  order: AdminOrder | null;
  onStatusChange: (status: AdminOrderStatus) => void;
}

const STATUS_FLOW: AdminOrderStatus[] = ['Pendiente', 'Confirmado', 'EnPreparacion', 'EnCamino', 'Entregado'];
const STATUS_LABELS: Record<AdminOrderStatus, string> = {
  Pendiente: 'Pendiente', Confirmado: 'Confirmado', EnPreparacion: 'En Preparación',
  EnCamino: 'En Camino', Entregado: 'Entregado', Cancelado: 'Cancelado',
};

export default function OrderDetailDrawer({ open, onClose, order, onStatusChange }: Props) {
  if (!open || !order) return null;

  const currentIdx = STATUS_FLOW.indexOf(order.estado as AdminOrderStatus);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <p className="font-extrabold text-gray-900">#{order.numeroPedido}</p>
            <p className="text-gray-400 text-xs mt-0.5">{new Date(order.fecha).toLocaleString('es-MX')}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><X size={18} /></button>
        </div>

        <div className="flex-1 p-5 space-y-5 overflow-y-auto">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">{order.clienteNombre}</p>
            <StatusBadge status={order.estado} />
          </div>

          <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
            <div className="flex gap-2 text-sm">
              <MapPin size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600">{order.direccionEntrega}</span>
            </div>
            <div className="flex gap-2 text-sm">
              <CreditCard size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600">{order.metodoPago}</span>
            </div>
            <div className="flex gap-2 text-sm">
              <Clock size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600">{order.restaurante}</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Productos</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-start gap-2 py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.nombre}</p>
                    <p className="text-xs text-gray-400">x{item.cantidad}</p>
                    {item.personalizacion?.notas && (
                      <p className="text-xs text-blue-500 italic">"{item.personalizacion.notas}"</p>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">${item.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-orange-50 rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
            {order.descuento > 0 && <div className="flex justify-between text-sm text-green-600"><span>Descuento</span><span>−${order.descuento.toFixed(2)}</span></div>}
            <div className="flex justify-between text-sm text-gray-600"><span>Envío</span><span>{order.envio === 0 ? 'Gratis' : `$${order.envio.toFixed(2)}`}</span></div>
            <div className="flex justify-between font-extrabold text-gray-900 border-t border-orange-100 pt-1.5 mt-1"><span>Total</span><span className="text-orange-500">${order.total.toFixed(2)}</span></div>
          </div>

          {order.estado !== 'Cancelado' && order.estado !== 'Entregado' && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Cambiar estado</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_FLOW.filter((_, i) => i > currentIdx).map((s) => (
                  <button key={s} onClick={() => onStatusChange(s)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors">
                    → {STATUS_LABELS[s]}
                  </button>
                ))}
                {order.estado !== 'Cancelado' && (
                  <button onClick={() => onStatusChange('Cancelado')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 transition-colors border border-red-200">
                    Cancelar pedido
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
