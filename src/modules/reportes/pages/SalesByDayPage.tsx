import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ReportHeader from '../components/ReportHeader';
import ReportFilterBar from '../components/ReportFilterBar';
import SalesByDayTable from '../components/SalesByDayTable';
import ReportChartCard from '../components/ReportChartCard';
import { VENTAS_POR_DIA_MOCK } from '../data/ventasPorDia.mock';

export default function SalesByDayPage() {
  const navigate = useNavigate();
  const [restaurante, setRestaurante] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const filtered = useMemo(() => {
    return VENTAS_POR_DIA_MOCK.filter((r) => {
      if (restaurante && r.Restaurante !== restaurante) return false;
      if (fechaInicio && r.Fecha < fechaInicio) return false;
      if (fechaFin && r.Fecha > fechaFin) return false;
      return true;
    });
  }, [restaurante, fechaInicio, fechaFin]);

  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((r) => { map[r.Fecha] = (map[r.Fecha] ?? 0) + r.TotalVentas; });
    return Object.entries(map)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [filtered]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <ReportHeader
          title="Ventas por Día"
          subtitle="Reporte detallado de ventas diarias por restaurante"
          icon="📅"
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
          fechaInicio={fechaInicio}
          onFechaInicioChange={setFechaInicio}
          fechaFin={fechaFin}
          onFechaFinChange={setFechaFin}
        />

        <ReportChartCard
          title={`Ventas totales por día${restaurante ? ` — ${restaurante}` : ''}`}
          data={chartData}
          color="orange"
          formatValue={(v) => `$${v.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
        />

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{filtered.length} registros encontrados</p>
        </div>

        <SalesByDayTable data={filtered} />
      </div>
    </div>
  );
}
