import { Filter } from 'lucide-react';
import { RESTAURANTES_LIST } from '../data/ventasPorDia.mock';

interface ReportFilterBarProps {
  restaurante: string;
  onRestauranteChange: (v: string) => void;
  fechaInicio?: string;
  onFechaInicioChange?: (v: string) => void;
  fechaFin?: string;
  onFechaFinChange?: (v: string) => void;
  extra?: React.ReactNode;
}

export default function ReportFilterBar({
  restaurante, onRestauranteChange,
  fechaInicio, onFechaInicioChange,
  fechaFin, onFechaFinChange,
  extra,
}: ReportFilterBarProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-gray-400 text-sm font-medium">
        <Filter size={14} /> Filtros
      </div>

      <select
        value={restaurante}
        onChange={(e) => onRestauranteChange(e.target.value)}
        className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 text-gray-700 bg-gray-50 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-all"
      >
        <option value="">Todos los restaurantes</option>
        {RESTAURANTES_LIST.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      {onFechaInicioChange && (
        <input
          type="date"
          value={fechaInicio ?? ''}
          onChange={(e) => onFechaInicioChange(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 text-gray-700 bg-gray-50 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-all"
        />
      )}

      {onFechaFinChange && (
        <input
          type="date"
          value={fechaFin ?? ''}
          onChange={(e) => onFechaFinChange(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 text-gray-700 bg-gray-50 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-all"
        />
      )}

      {extra}
    </div>
  );
}
