import type { OrderStatus } from '../types/cart.types';

interface Props {
  estado: OrderStatus;
}

const CONFIG: Record<OrderStatus, { label: string; classes: string; dot: string }> = {
  Pendiente: {
    label: 'Pendiente',
    classes: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    dot: 'bg-yellow-400',
  },
  Confirmado: {
    label: 'Confirmado',
    classes: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-400',
  },
  EnPreparacion: {
    label: 'En Preparación',
    classes: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-400',
  },
  EnCamino: {
    label: 'En Camino',
    classes: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-400',
  },
  Entregado: {
    label: 'Entregado',
    classes: 'bg-green-50 text-green-700 border-green-200',
    dot: 'bg-green-400',
  },
  Cancelado: {
    label: 'Cancelado',
    classes: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-400',
  },
};

export default function OrderStatusBadge({ estado }: Props) {
  const c = CONFIG[estado];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${c.classes}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
}
