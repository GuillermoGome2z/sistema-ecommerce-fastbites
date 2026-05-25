import type { IntegrationStatus, ModuleStatusType } from '../types/reportes.types';

interface Props {
  item: IntegrationStatus;
}

const STATUS_CONFIG: Record<ModuleStatusType, { bg: string; text: string; dot: string; label: string }> = {
  Completado:  { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500',  label: 'Completado'   },
  EnProgreso:  { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500',   label: 'En progreso'  },
  Pendiente:   { bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-400',  label: 'Pendiente'    },
  Bloqueado:   { bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500',    label: 'Bloqueado'    },
};

export default function IntegrationStatusCard({ item }: Props) {
  const s = STATUS_CONFIG[item.estado];
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{item.icono}</span>
          <div>
            <p className="font-extrabold text-gray-900 text-sm leading-tight">{item.nombre}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.descripcion}</p>
          </div>
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${s.bg} ${s.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {s.label}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 border-t border-gray-50 pt-3">
        <span><span className="font-semibold text-gray-700">Responsable:</span> {item.responsable}</span>
        {item.dependencias.length > 0 && (
          <span><span className="font-semibold text-gray-700">Deps:</span> {item.dependencias.join(', ')}</span>
        )}
      </div>

      {item.observaciones && (
        <p className="text-xs text-gray-400 italic leading-relaxed">{item.observaciones}</p>
      )}
    </div>
  );
}
