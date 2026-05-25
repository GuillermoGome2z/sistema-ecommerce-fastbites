import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ReportHeader from '../components/ReportHeader';
import ReportFilterBar from '../components/ReportFilterBar';
import SalesByHourTable from '../components/SalesByHourTable';
import ReportChartCard from '../components/ReportChartCard';
import { VENTAS_POR_HORA_MOCK, HORAS_LIST } from '../data/ventasPorHora.mock';

export default function SalesByHourPage() {
  const navigate = useNavigate();
  const [restaurante, setRestaurante] = useState('');
  const [horaFilter, setHoraFilter] = useState<string>('');

  const filtered = useMemo(() => {
    return VENTAS_POR_HORA_MOCK.filter((r) => {
      if (restaurante && r.Restaurante !== restaurante) return false;
      if (horaFilter !== '' && r.Hora !== Number(horaFilter)) return false;
      return true;
    });
  }, [restaurante, horaFilter]);

  const chartData = useMemo(() => {
    const map: Record<number, number> = {};
    filtered.forEach((r) => { map[r.Hora] = (map[r.Hora] ?? 0) + r.TotalVentas; });
    return Object.entries(map)
      .map(([h, value]) => ({ label: `${h}:00`, value }))
      .sort((a, b) => parseInt(a.label) - parseInt(b.label));
  }, [filtered]);

  const horaSelect = (
    <select
      value={horaFilter}
      onChange={(e) => setHoraFilter(e.target.value)}
      className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 text-gray-700 bg-gray-50 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-all"
    >
      <option value="">Todas las horas</option>
      {HORAS_LIST.map((h) => (
        <option key={h} value={h}>{h}:00</option>
      ))}
    </select>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <ReportHeader
          title="Ventas por Hora"
          subtitle="Identificación de horas pico y distribución horaria de pedidos"
          icon="⏰"
          actions={
            <button
              onClick={() => navigate('/reportes')}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 font-medium transition-colors"
            >
              <ArrowLeft size={14} /> Volver
            </button>
          }
        />

        <ReportFilterBar
          restaurante={restaurante}
          onRestauranteChange={setRestaurante}
          extra={horaSelect}
        />

        <ReportChartCard
          title={`Ventas por hora${restaurante ? ` — ${restaurante}` : ''}`}
          data={chartData}
          color="amber"
          formatValue={(v) => `$${v.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          maxItems={16}
        />

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{filtered.length} registros encontrados</p>
        </div>

        <SalesByHourTable data={filtered} />
      </div>
    </div>
  );
}
