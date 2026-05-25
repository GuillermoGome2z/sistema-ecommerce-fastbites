import type { ModuleStatus, ModuleStatusType } from '../types/reportes.types';

interface Props {
  item: ModuleStatus;
}

const STATUS_CONFIG: Record<ModuleStatusType, { bg: string; text: string; border: string; label: string }> = {
  Completado: { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200', label: 'Completado'  },
  EnProgreso: { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',  label: 'En progreso' },
  Pendiente:  { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200', label: 'Pendiente'   },
  Bloqueado:  { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',   label: 'Bloqueado'   },
};

export default function ModuleStatusCard({ item }: Props) {
  const s = STATUS_CONFIG[item.estado];
  return (
    <div className={`rounded-2xl border ${s.border} ${s.bg} p-4 flex flex-col gap-2`}>
      <div className="flex items-center justify-between gap-2">
        <p className="font-extrabold text-gray-900 text-sm">Módulo {item.id}: {item.modulo}</p>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white border ${s.border} ${s.text}`}>
          {s.label}
        </span>
      </div>
      <p className="text-xs text-gray-500">{item.descripcion}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 border-t border-white/60 pt-2 mt-1">
        <span><span className="font-semibold text-gray-700">v{item.version}</span></span>
        <span><span className="font-semibold text-gray-700">Archivos:</span> {item.archivos}</span>
        <span><span className="font-semibold text-gray-700">Owner:</span> {item.responsable}</span>
      </div>
      {item.observaciones && (
        <p className="text-xs text-gray-400 italic">{item.observaciones}</p>
      )}
    </div>
  );
}
