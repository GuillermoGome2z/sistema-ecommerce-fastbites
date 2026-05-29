import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ReportHeader from '../components/ReportHeader';
import ReportFilterBar from '../components/ReportFilterBar';
import SalesByDayTable from '../components/SalesByDayTable';
import ReportChartCard from '../components/ReportChartCard';
import type { VentaPorDia } from '../types/reportes.types';
import { API_BASE_URL } from '../../../config/api';

export default function SalesByDayPage() {
  const navigate = useNavigate();
  const [data, setData]         = useState<VentaPorDia[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [restaurante, setRestaurante]   = useState('');
  const [fechaInicio, setFechaInicio]   = useState('');
  const [fechaFin, setFechaFin]         = useState('');

  useEffect(() => {
    const token = localStorage.getItem('fb_token');
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${API_BASE_URL}/api/reports/ventas-dia`, { headers })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json.data as VentaPorDia[]);
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
      if (fechaInicio && r.Fecha < fechaInicio) return false;
      if (fechaFin && r.Fecha > fechaFin) return false;
      return true;
    });
  }, [data, restaurante, fechaInicio, fechaFin]);

  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((r) => { map[r.Fecha] = (map[r.Fecha] ?? 0) + r.TotalVentas; });
    return Object.entries(map)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [filtered]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <ReportHeader
          title="Ventas por Día"
          subtitle="Reporte detallado de ventas diarias por restaurante"
          icon="📅"
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
          </>
        )}
      </div>
    </div>
  );
}
