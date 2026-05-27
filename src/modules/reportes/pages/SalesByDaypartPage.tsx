import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ReportHeader from '../components/ReportHeader';
import ReportFilterBar from '../components/ReportFilterBar';
import SalesByDaypartTable from '../components/SalesByDaypartTable';
import type { VentaPorDaypart, DaypartName } from '../types/reportes.types';
import { API_BASE_URL } from '../../../config/api';

const DAYPARTS: DaypartName[] = ['Desayuno', 'Almuerzo', 'Cena'];
const DAYPART_CONFIG: Record<DaypartName, { emoji: string; bg: string; border: string; text: string; badge: string }> = {
  Desayuno: { emoji: '🌅', bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  badge: 'bg-amber-500'  },
  Almuerzo: { emoji: '🍔', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-500' },
  Cena:     { emoji: '🍕', bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    badge: 'bg-red-500'    },
};

export default function SalesByDaypartPage() {
  const navigate = useNavigate();
  const [data, setData]       = useState<VentaPorDaypart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [restaurante, setRestaurante]       = useState('');
  const [daypartFilter, setDaypartFilter]   = useState<DaypartName | ''>('');

  useEffect(() => {
    const token = localStorage.getItem('fb_token');
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${API_BASE_URL}/api/reports/ventas-daypart`, { headers })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json.data as VentaPorDaypart[]);
        else setError(json.message ?? 'Error al cargar el reporte.');
      })
      .catch(() => setError('No se pudo conectar con el servidor.'))
      .finally(() => setLoading(false));
  }, []);

  const restaurantesList = useMemo(
    () => [...new Set(data.map((r) => r.Restaurante))].sort(),
    [data],
  );

  const filtered = useMemo(() => {
    return data.filter((r) => {
      if (restaurante && r.Restaurante !== restaurante) return false;
      if (daypartFilter && r.Daypart !== daypartFilter) return false;
      return true;
    });
  }, [data, restaurante, daypartFilter]);

  const daypartTotals = useMemo(() => {
    const map: Record<string, { ventas: number; pedidos: number }> = {};
    data.forEach((r) => {
      if (!map[r.Daypart]) map[r.Daypart] = { ventas: 0, pedidos: 0 };
      map[r.Daypart].ventas += r.TotalVentas;
      map[r.Daypart].pedidos += r.TotalPedidos;
    });
    return map;
  }, [data]);

  const maxVentas = Math.max(...Object.values(daypartTotals).map((d) => d.ventas), 1);

  const daypartSelect = (
    <select
      value={daypartFilter}
      onChange={(e) => setDaypartFilter(e.target.value as DaypartName | '')}
      className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 text-gray-700 bg-gray-50 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-all"
    >
      <option value="">Todos los dayparts</option>
      {DAYPARTS.map((d) => <option key={d} value={d}>{d}</option>)}
    </select>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <ReportHeader
          title="Ventas por Daypart"
          subtitle="Análisis de rendimiento por turno: Desayuno, Almuerzo y Cena"
          icon="🍽️"
          actions={
            <button
              onClick={() => navigate('/admin/reportes')}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 font-medium transition-colors"
            >
              <ArrowLeft size={14} /> Volver
            </button>
          }
        />

        {loading && (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-500 text-sm">Cargando reporte...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-6 py-4 rounded-2xl text-center">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {DAYPARTS.map((dp) => {
                const c = DAYPART_CONFIG[dp];
                const totals = daypartTotals[dp] ?? { ventas: 0, pedidos: 0 };
                const pct = Math.round((totals.ventas / maxVentas) * 100);
                const isTop = totals.ventas === maxVentas && totals.ventas > 0;
                return (
                  <div key={dp} className={`${c.bg} border ${c.border} rounded-2xl p-5 relative overflow-hidden`}>
                    {isTop && (
                      <span className="absolute top-3 right-3 text-xs font-bold bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full">
                        🏆 Top
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{c.emoji}</span>
                      <p className={`font-extrabold text-lg ${c.text}`}>{dp}</p>
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900">
                      ${totals.ventas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{totals.pedidos} pedidos totales</p>
                    <div className="mt-3 h-2 rounded-full bg-white/60 overflow-hidden">
                      <div className={`h-full ${c.badge} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className={`text-xs font-bold mt-1 ${c.text}`}>{pct}% del total</p>
                  </div>
                );
              })}
            </div>

            <ReportFilterBar
              restaurante={restaurante}
              onRestauranteChange={setRestaurante}
              restaurantes={restaurantesList}
              extra={daypartSelect}
            />

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{filtered.length} registros encontrados</p>
            </div>

            <SalesByDaypartTable data={filtered} />
          </>
        )}
      </div>
    </div>
  );
}
