import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ReportHeader from '../components/ReportHeader';
import IntegrationStatusCard from '../components/IntegrationStatusCard';
import ModuleStatusCard from '../components/ModuleStatusCard';
import { INTEGRACION_MOCK } from '../data/integracion.mock';
import { MODULOS_MOCK } from '../data/modulos.mock';
import type { ModuleStatusType } from '../types/reportes.types';

const STATUS_FILTERS: (ModuleStatusType | 'Todos')[] = ['Todos', 'Completado', 'EnProgreso', 'Pendiente', 'Bloqueado'];
const STATUS_LABELS: Record<string, string> = {
  Todos: 'Todos', Completado: 'Completado', EnProgreso: 'En progreso', Pendiente: 'Pendiente', Bloqueado: 'Bloqueado',
};

export default function IntegrationStatusPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ModuleStatusType | 'Todos'>('Todos');

  const filteredIntegracion = useMemo(
    () => filter === 'Todos' ? INTEGRACION_MOCK : INTEGRACION_MOCK.filter((i) => i.estado === filter),
    [filter],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { Todos: INTEGRACION_MOCK.length };
    INTEGRACION_MOCK.forEach((i) => { c[i.estado] = (c[i.estado] ?? 0) + 1; });
    return c;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-7">
        <ReportHeader
          title="Estado de Integración"
          subtitle="Revisión técnica del estado actual de todos los módulos y dependencias"
          icon="🔌"
          actions={
            <button
              onClick={() => navigate('/reportes')}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 font-medium transition-colors"
            >
              <ArrowLeft size={14} /> Volver
            </button>
          }
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Completados', key: 'Completado', color: 'bg-green-500', light: 'bg-green-50 text-green-800 border-green-200' },
            { label: 'En progreso', key: 'EnProgreso', color: 'bg-blue-500',  light: 'bg-blue-50 text-blue-800 border-blue-200'   },
            { label: 'Pendientes',  key: 'Pendiente',  color: 'bg-amber-500', light: 'bg-amber-50 text-amber-800 border-amber-200' },
            { label: 'Bloqueados',  key: 'Bloqueado',  color: 'bg-red-500',   light: 'bg-red-50 text-red-800 border-red-200'       },
          ].map((s) => (
            <div key={s.key} className={`border rounded-2xl p-4 ${s.light} flex items-center gap-3`}>
              <div className={`w-3 h-3 rounded-full ${s.color} flex-shrink-0`} />
              <div>
                <p className="text-xl font-extrabold">{counts[s.key] ?? 0}</p>
                <p className="text-xs font-medium opacity-80">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
          <h2 className="font-extrabold text-gray-900 mb-4">Módulos del sistema</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MODULOS_MOCK.map((m) => <ModuleStatusCard key={m.id} item={m} />)}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-extrabold text-gray-900">Componentes de integración</h2>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    filter === s
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500'
                  }`}
                >
                  {STATUS_LABELS[s]}
                  <span className="ml-1.5 opacity-70">({counts[s] ?? 0})</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIntegracion.map((item) => <IntegrationStatusCard key={item.id} item={item} />)}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-bold text-amber-800 text-sm">Backend pendiente</p>
            <p className="text-xs text-amber-700 mt-1">
              El Backend/API aún no está implementado. Todos los módulos operan con datos mock temporales.
              Una vez disponible el servidor, los módulos están estructurados para conectarse a los endpoints correspondientes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
