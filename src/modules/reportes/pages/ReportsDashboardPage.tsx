import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, Clock, TrendingUp, Utensils, ArrowRight } from 'lucide-react';
import ReportHeader from '../components/ReportHeader';
import ReportStatCard from '../components/ReportStatCard';
import ReportChartCard from '../components/ReportChartCard';
import type { VentaPorDia, VentaPorHora, VentaPorDaypart, DaypartName } from '../types/reportes.types';
import { API_BASE_URL } from '../../../config/api';

const DAYPART_EMOJI: Record<DaypartName, string> = { Desayuno: '🌅', Almuerzo: '🍔', Cena: '🍕' };

export default function ReportsDashboardPage() {
  const navigate = useNavigate();

  const [ventasDia, setVentasDia] = useState<VentaPorDia[]>([]);
  const [ventasHora, setVentasHora] = useState<VentaPorHora[]>([]);
  const [ventasDaypart, setVentasDaypart] = useState<VentaPorDaypart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('fb_token');
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.all([
      fetch(`${API_BASE_URL}/api/reports/ventas-dia`, { headers }),
      fetch(`${API_BASE_URL}/api/reports/ventas-hora`, { headers }),
      fetch(`${API_BASE_URL}/api/reports/ventas-daypart`, { headers }),
    ])
      .then(async ([resDia, resHora, resDaypart]) => {
        const [jsonDia, jsonHora, jsonDaypart] = await Promise.all([
          resDia.json(),
          resHora.json(),
          resDaypart.json(),
        ]);
        if (jsonDia.success) setVentasDia(jsonDia.data);
        if (jsonHora.success) setVentasHora(jsonHora.data);
        if (jsonDaypart.success) setVentasDaypart(jsonDaypart.data);
      })
      .catch(() => setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.'))
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    const totalVentas = ventasDia.reduce((s, r) => s + r.TotalVentas, 0);
    const totalPedidos = ventasDia.reduce((s, r) => s + r.TotalPedidos, 0);
    const ticketPromedio = totalPedidos > 0 ? totalVentas / totalPedidos : 0;

    const daypartTotals: Record<string, number> = {};
    ventasDaypart.forEach((r) => {
      daypartTotals[r.Daypart] = (daypartTotals[r.Daypart] ?? 0) + r.TotalVentas;
    });
    const daypartMasVendido = Object.entries(daypartTotals).sort((a, b) => b[1] - a[1])[0]?.[0] as DaypartName ?? 'Almuerzo';

    const horaTotals: Record<number, number> = {};
    ventasHora.forEach((r) => {
      horaTotals[r.Hora] = (horaTotals[r.Hora] ?? 0) + r.TotalVentas;
    });
    const horaMasVentas = Number(Object.entries(horaTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 13);

    return { totalVentas, totalPedidos, ticketPromedio, daypartMasVendido, horaMasVentas };
  }, [ventasDia, ventasDaypart, ventasHora]);

  const chartDia = useMemo(() => {
    const map: Record<string, number> = {};
    ventasDia.forEach((r) => { map[r.Fecha] = (map[r.Fecha] ?? 0) + r.TotalVentas; });
    return Object.entries(map).map(([label, value]) => ({ label, value })).sort((a, b) => a.label.localeCompare(b.label));
  }, [ventasDia]);

  const chartHora = useMemo(() => {
    const map: Record<number, number> = {};
    ventasHora.forEach((r) => { map[r.Hora] = (map[r.Hora] ?? 0) + r.TotalVentas; });
    return Object.entries(map)
      .map(([h, value]) => ({ label: `${h}:00`, value }))
      .sort((a, b) => parseInt(a.label) - parseInt(b.label));
  }, [ventasHora]);

  const chartDaypart = useMemo(() => {
    const map: Record<string, number> = {};
    ventasDaypart.forEach((r) => { map[r.Daypart] = (map[r.Daypart] ?? 0) + r.TotalVentas; });
    return Object.entries(map).map(([label, value]) => ({ label, value }));
  }, [ventasDaypart]);

  const h12 = summary.horaMasVentas > 12 ? summary.horaMasVentas - 12 : summary.horaMasVentas;
  const suffix = summary.horaMasVentas >= 12 ? 'PM' : 'AM';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Cargando reportes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-6 py-4 rounded-2xl max-w-md text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-7">
        <ReportHeader
          title="Dashboard de Reportes"
          subtitle="Resumen ejecutivo de ventas y métricas del sistema FastBites"
          icon="📊"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <ReportStatCard label="Ventas Totales" value={`$${summary.totalVentas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`} icon="💰" color="orange" trend="+12% vs semana anterior" trendUp />
          <ReportStatCard label="Total Pedidos" value={String(summary.totalPedidos)} icon="🛒" color="amber" trend="+8% vs semana anterior" trendUp />
          <ReportStatCard label="Ticket Promedio" value={`$${summary.ticketPromedio.toFixed(2)}`} icon="🎫" color="red" />
          <ReportStatCard label="Daypart Top" value={`${DAYPART_EMOJI[summary.daypartMasVendido]} ${summary.daypartMasVendido}`} icon="🏆" color="gray" />
          <ReportStatCard label="Hora Pico" value={`${h12}:00 ${suffix}`} icon="⏰" color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <ReportChartCard
            title="Ventas por Día"
            data={chartDia}
            color="orange"
            formatValue={(v) => `$${(v / 1000).toFixed(1)}k`}
          />
          <ReportChartCard
            title="Ventas por Hora"
            data={chartHora}
            color="amber"
            formatValue={(v) => `$${(v / 1000).toFixed(1)}k`}
          />
          <ReportChartCard
            title="Ventas por Daypart"
            data={chartDaypart}
            color="red"
            formatValue={(v) => `$${(v / 1000).toFixed(1)}k`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <BarChart2 size={18} />, title: 'Ventas por Día', desc: 'Análisis diario por restaurante', path: '/reportes/ventas-dia', color: 'orange' },
            { icon: <Clock size={18} />, title: 'Ventas por Hora', desc: 'Identifica horas pico', path: '/reportes/ventas-hora', color: 'amber' },
            { icon: <Utensils size={18} />, title: 'Ventas por Daypart', desc: 'Desayuno, Almuerzo y Cena', path: '/reportes/ventas-daypart', color: 'red' },
            { icon: <TrendingUp size={18} />, title: 'Estado de Integración', desc: 'Revisión técnica del sistema', path: '/reportes/integracion', color: 'gray' },
          ].map((card) => (
            <button
              key={card.path}
              onClick={() => navigate(card.path)}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 text-left hover:shadow-md hover:border-orange-200 transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-white ${
                card.color === 'orange' ? 'bg-orange-500' :
                card.color === 'amber' ? 'bg-amber-500' :
                card.color === 'red' ? 'bg-red-500' : 'bg-gray-700'
              }`}>
                {card.icon}
              </div>
              <p className="font-extrabold text-gray-900 text-sm">{card.title}</p>
              <p className="text-xs text-gray-400 mt-1">{card.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-orange-500 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Ver reporte <ArrowRight size={12} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
