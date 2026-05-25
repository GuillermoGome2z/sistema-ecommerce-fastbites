import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ReportHeader from '../components/ReportHeader';
import ReportFilterBar from '../components/ReportFilterBar';
import SalesByDaypartTable from '../components/SalesByDaypartTable';
import { VENTAS_POR_DAYPART_MOCK } from '../data/ventasPorDaypart.mock';
import type { DaypartName } from '../types/reportes.types';

const DAYPARTS: DaypartName[] = ['Desayuno', 'Almuerzo', 'Cena'];
const DAYPART_CONFIG: Record<DaypartName, { emoji: string; bg: string; border: string; text: string; badge: string }> = {
  Desayuno: { emoji: '🌅', bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  badge: 'bg-amber-500'  },
  Almuerzo: { emoji: '🍔', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-500' },
  Cena:     { emoji: '🍕', bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    badge: 'bg-red-500'    },
};

export default function SalesByDaypartPage() {
  const navigate = useNavigate();
  const [restaurante, setRestaurante] = useState('');
  const [daypartFilter, setDaypartFilter] = useState<DaypartName | ''>('');

  const filtered = useMemo(() => {
    return VENTAS_POR_DAYPART_MOCK.filter((r) => {
      if (restaurante && r.Restaurante !== restaurante) return false;
      if (daypartFilter && r.Daypart !== daypartFilter) return false;
      return true;
    });
  }, [restaurante, daypartFilter]);

  const daypartTotals = useMemo(() => {
    const map: Record<string, { ventas: number; pedidos: number }> = {};
    VENTAS_POR_DAYPART_MOCK.forEach((r) => {
      if (!map[r.Daypart]) map[r.Daypart] = { ventas: 0, pedidos: 0 };
      map[r.Daypart].ventas += r.TotalVentas;
      map[r.Daypart].pedidos += r.TotalPedidos;
    });
    return map;
  }, []);

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
              onClick={() => navigate('/reportes')}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 font-medium transition-colors"
            >
              <ArrowLeft size={14} /> Volver
            </button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {DAYPARTS.map((dp) => {
            const c = DAYPART_CONFIG[dp];
            const totals = daypartTotals[dp] ?? { ventas: 0, pedidos: 0 };
            const pct = Math.round((totals.ventas / maxVentas) * 100);
            const isTop = totals.ventas === maxVentas;
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
          extra={daypartSelect}
        />

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{filtered.length} registros encontrados</p>
        </div>

        <SalesByDaypartTable data={filtered} />
      </div>
    </div>
  );
}
