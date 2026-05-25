import { useState } from 'react';
import { Clock, ToggleLeft, ToggleRight } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import StatusBadge from '../components/StatusBadge';
import ActionButton from '../components/ActionButton';
import { ADMIN_PRODUCTOS_MOCK } from '../data/adminProductos.mock';
import type { Daypart } from '../types/backoffice.types';

const DAYPARTS_MOCK: Daypart[] = [
  { id: 1, nombre: 'Desayuno', horaInicio: '07:00', horaFin: '11:00', activo: true, productosCount: 2, emoji: '🌅', descripcion: 'Menú de la mañana. Ideal para comenzar el día con energía.' },
  { id: 2, nombre: 'Almuerzo', horaInicio: '11:00', horaFin: '17:00', activo: true, productosCount: 4, emoji: '🍔', descripcion: 'Menú del mediodía. Nuestras hamburguesas y combos más populares.' },
  { id: 3, nombre: 'Cena', horaInicio: '17:00', horaFin: '23:00', activo: true, productosCount: 2, emoji: '🍕', descripcion: 'Menú nocturno. Pizzas artesanales y opciones para compartir.' },
];

const DAYPART_CATEGORIES: Record<string, string> = {
  Desayuno: 'Desayuno',
  Almuerzo: 'Almuerzo',
  Cena: 'Cena',
};

const DAYPART_COLORS: Record<string, { bg: string; border: string; badge: string; text: string }> = {
  Desayuno: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-500', text: 'text-amber-700' },
  Almuerzo: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-500', text: 'text-orange-700' },
  Cena:     { bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-500',    text: 'text-red-700' },
};

export default function AdminDaypartPage() {
  const [dayparts, setDayparts] = useState<Daypart[]>(DAYPARTS_MOCK);

  const toggleActive = (id: number) =>
    setDayparts((prev) => prev.map((d) => (d.id === id ? { ...d, activo: !d.activo } : d)));

  return (
    <AdminLayout title="Dayparts">
      <div className="space-y-6">
        <p className="text-gray-500 text-sm">
          Administra los horarios de servicio y los productos disponibles en cada turno.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {dayparts.map((dp) => {
            const c = DAYPART_COLORS[dp.nombre] ?? DAYPART_COLORS.Almuerzo;
            const products = ADMIN_PRODUCTOS_MOCK.filter(
              (p) => p.categoria === DAYPART_CATEGORIES[dp.nombre] && p.activo
            );

            return (
              <div key={dp.id} className={`rounded-2xl shadow-sm border ${c.border} overflow-hidden`}>
                <div className={`${c.bg} px-5 py-4`}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{dp.emoji}</span>
                      <div>
                        <h3 className={`font-extrabold text-lg ${c.text}`}>{dp.nombre}</h3>
                        <StatusBadge status="" active={dp.activo} />
                      </div>
                    </div>
                    <ActionButton
                      onClick={() => toggleActive(dp.id)}
                      icon={dp.activo ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      label={dp.activo ? 'Desactivar' : 'Activar'}
                      variant={dp.activo ? 'warning' : 'success'}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={14} className="flex-shrink-0" />
                    <span className="font-semibold">{dp.horaInicio} – {dp.horaFin}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{dp.descripcion}</p>
                </div>

                <div className="bg-white px-5 py-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                    Productos activos ({products.length})
                  </p>
                  {products.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">Sin productos activos</p>
                  ) : (
                    <div className="space-y-2">
                      {products.map((p) => (
                        <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                          <img src={p.imagen} alt={p.nombre} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{p.nombre}</p>
                            <p className="text-xs text-gray-400">{p.restaurante}</p>
                          </div>
                          <p className="text-orange-500 font-bold text-sm flex-shrink-0">${p.precioBase.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
