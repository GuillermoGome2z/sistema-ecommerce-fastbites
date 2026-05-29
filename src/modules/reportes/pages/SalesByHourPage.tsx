import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ReportHeader from '../components/ReportHeader';
import ReportFilterBar from '../components/ReportFilterBar';
import SalesByHourTable from '../components/SalesByHourTable';
import ReportChartCard from '../components/ReportChartCard';
import type { VentaPorHora } from '../types/reportes.types';
import { API_BASE_URL } from '../../../config/api';

export default function SalesByHourPage() {
  const navigate = useNavigate();
  const [data, setData]       = useState<VentaPorHora[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [restaurante, setRestaurante] = useState('');
  const [horaFilter, setHoraFilter]   = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('fb_token');
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${API_BASE_URL}/api/reports/ventas-hora`, { headers })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json.data as VentaPorHora[]);
        else setError(json.message ?? 'Error al cargar el reporte.');
      })
      .catch(() => setError('No se pudo conectar con el servidor.'))
      .finally(() => setLoading(false));
  }, []);

  const restaurantesList = useMemo(
    () => [...new Set(data.map((r) => r.Restaurante))].sort(),
    [data],
  );

  const horasList = useMemo(
    () => [...new Set(data.map((r) => r.Hora))].sort((a, b) => a - b),
    [data],
  );

  const filtered = useMemo(() => {
    return data.filter((r) => {
      if (restaurante && r.Restaurante !== restaurante) return false;
      if (horaFilter !== '' && r.Hora !== Number(horaFilter)) return false;
      return true;
    });
  }, [data, restaurante, horaFilter]);

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
      {horasList.map((h) => (
        <option key={h} value={h}>{h}:00</option>
      ))}
    </select>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <ReportHeader
          title="Ventas por Hora"
          subtitle="Identificación de horas pico y distribución horaria de pedidos"
          icon="⏰"
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
            <ReportFilterBar
              restaurante={restaurante}
              onRestauranteChange={setRestaurante}
              restaurantes={restaurantesList}
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
          </>
        )}
      </div>
    </div>
  );
}
