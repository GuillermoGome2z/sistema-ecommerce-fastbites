import { useState, useEffect, useCallback } from 'react';
import { Clock, ToggleLeft, ToggleRight, Loader, UtensilsCrossed } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import StatusBadge from '../components/StatusBadge';
import ActionButton from '../components/ActionButton';
import type { Daypart, AdminProduct } from '../types/backoffice.types';
import { API_BASE_URL } from '../../../config/api';

const DAYPART_STATIC: Record<string, { emoji: string; descripcion: string }> = {
  Desayuno: { emoji: '🌅', descripcion: 'Menú de la mañana. Ideal para comenzar el día con energía.' },
  Almuerzo: { emoji: '🍔', descripcion: 'Menú del mediodía. Nuestras hamburguesas y combos más populares.' },
  Cena:     { emoji: '🍕', descripcion: 'Menú nocturno. Pizzas artesanales y opciones para compartir.' },
};

const DAYPART_COLORS: Record<string, { bg: string; border: string; badge: string; text: string }> = {
  Desayuno: { bg: 'bg-amber-50',  border: 'border-amber-200',  badge: 'bg-amber-500',  text: 'text-amber-700' },
  Almuerzo: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-500', text: 'text-orange-700' },
  Cena:     { bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-500',    text: 'text-red-700' },
};

export default function AdminDaypartPage() {
  const [dayparts, setDayparts] = useState<Daypart[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const token = () => localStorage.getItem('fb_token') ?? '';

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const headers: HeadersInit = { Authorization: `Bearer ${token()}` };
      const [dpRes, prodsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/dayparts`,  { headers }),
        fetch(`${API_BASE_URL}/api/admin/products`,  { headers }),
      ]);
      const [dpJson, prodsJson] = await Promise.all([dpRes.json(), prodsRes.json()]);

      if (dpJson.success) {
        const enriched: Daypart[] = (dpJson.data as Omit<Daypart, 'emoji' | 'descripcion'>[]).map((d) => ({
          ...d,
          emoji:      DAYPART_STATIC[d.nombre]?.emoji      ?? '🍽️',
          descripcion: DAYPART_STATIC[d.nombre]?.descripcion ?? '',
        }));
        setDayparts(enriched);
      } else {
        setError(dpJson.message ?? 'Error al cargar dayparts.');
      }

      if (prodsJson.success) setProducts(prodsJson.data as AdminProduct[]);
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleActive = async (id: number) => {
    setDayparts((prev) => prev.map((d) => d.id === id ? { ...d, activo: !d.activo } : d));
    try {
      await fetch(`${API_BASE_URL}/api/admin/dayparts/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token()}` },
      });
    } catch {
      setDayparts((prev) => prev.map((d) => d.id === id ? { ...d, activo: !d.activo } : d));
    }
  };

  return (
    <AdminLayout title="Dayparts">
      <div className="space-y-6">
        <p className="text-gray-500 text-sm">
          Administra los horarios de servicio y los productos disponibles en cada turno.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <Loader className="w-7 h-7 text-orange-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {dayparts.map((dp) => {
              const c = DAYPART_COLORS[dp.nombre] ?? DAYPART_COLORS.Almuerzo;
              const dpProducts = products.filter((p) => p.categoria === dp.nombre && p.activo);

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
                      Productos activos ({dpProducts.length})
                    </p>
                    {dpProducts.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">Sin productos activos</p>
                    ) : (
                      <div className="space-y-2">
                        {dpProducts.map((p) => (
                          <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                            {p.imagen ? (
                              <img src={p.imagen} alt={p.nombre} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                                <UtensilsCrossed size={14} className="text-orange-500" />
                              </div>
                            )}
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
        )}
      </div>
    </AdminLayout>
  );
}
