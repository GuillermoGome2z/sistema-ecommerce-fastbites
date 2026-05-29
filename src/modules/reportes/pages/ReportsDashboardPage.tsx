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

  const ventasPorRestaurante = useMemo(() => {
    const map: Record<string, { ventas: number; pedidos: number }> = {};
    ventasDia.forEach((r) => {
      if (!r.Restaurante) return;
      if (!map[r.Restaurante]) map[r.Restaurante] = { ventas: 0, pedidos: 0 };
      map[r.Restaurante].ventas += r.TotalVentas;
      map[r.Restaurante].pedidos += r.TotalPedidos;
    });
    return Object.entries(map)
      .map(([nombre, t]) => ({
        nombre,
        ventas: t.ventas,
        pedidos: t.pedidos,
        ticketPromedio: t.pedidos > 0 ? t.ventas / t.pedidos : 0,
      }))
      .sort((a, b) => b.ventas - a.ventas);
  }, [ventasDia]);

  const chartRestaurante = useMemo(
    () => ventasPorRestaurante.map((r) => ({ label: r.nombre, value: r.ventas })),
    [ventasPorRestaurante],
  );

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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
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
            { icon: <BarChart2 size={18} />, title: 'Ventas por Día', desc: 'Análisis diario por restaurante', path: '/admin/reportes/ventas-dia', color: 'orange' },
            { icon: <Clock size={18} />, title: 'Ventas por Hora', desc: 'Identifica horas pico', path: '/admin/reportes/ventas-hora', color: 'amber' },
            { icon: <Utensils size={18} />, title: 'Ventas por Daypart', desc: 'Desayuno, Almuerzo y Cena', path: '/admin/reportes/ventas-daypart', color: 'red' },
            { icon: <TrendingUp size={18} />, title: 'Estado de Integración', desc: 'Revisión técnica del sistema', path: '/admin/reportes/integracion', color: 'gray' },
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

        {ventasPorRestaurante.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-extrabold text-gray-900 text-base">Ventas por Restaurante</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ReportChartCard
                title="Total de ventas por restaurante"
                data={chartRestaurante}
                color="orange"
                formatValue={(v) => `$${v.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
              />
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 text-sm">Resumen comparativo</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Restaurante</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Pedidos</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ventas</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ticket Prom.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventasPorRestaurante.map((r, i) => (
                        <tr key={r.nombre} className="border-b border-gray-50 last:border-0 hover:bg-orange-50/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {i === 0 && <span className="mr-1.5">🏆</span>}
                            {r.nombre}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600">{r.pedidos}</td>
                          <td className="px-4 py-3 text-right font-bold text-orange-500">
                            ${r.ventas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-500">
                            ${r.ticketPromedio.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
