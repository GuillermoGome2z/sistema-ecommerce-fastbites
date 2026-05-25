interface Props {
  status: string;
  active?: boolean;
}

type BadgeConfig = { label: string; classes: string; dot: string };

const ORDER_CONFIG: Record<string, BadgeConfig> = {
  Pendiente:      { label: 'Pendiente',       classes: 'bg-yellow-50 text-yellow-700 border-yellow-200',   dot: 'bg-yellow-400' },
  Confirmado:     { label: 'Confirmado',      classes: 'bg-blue-50 text-blue-700 border-blue-200',         dot: 'bg-blue-400' },
  EnPreparacion:  { label: 'En Preparación',  classes: 'bg-orange-50 text-orange-700 border-orange-200',   dot: 'bg-orange-400' },
  EnCamino:       { label: 'En Camino',       classes: 'bg-purple-50 text-purple-700 border-purple-200',   dot: 'bg-purple-400' },
  Entregado:      { label: 'Entregado',       classes: 'bg-green-50 text-green-700 border-green-200',      dot: 'bg-green-400' },
  Cancelado:      { label: 'Cancelado',       classes: 'bg-red-50 text-red-700 border-red-200',            dot: 'bg-red-400' },
};

export default function StatusBadge({ status, active }: Props) {
  if (active !== undefined) {
    const cfg: BadgeConfig = active
      ? { label: 'Activo',   classes: 'bg-green-50 text-green-700 border-green-200',  dot: 'bg-green-400' }
      : { label: 'Inactivo', classes: 'bg-gray-100 text-gray-500 border-gray-200',    dot: 'bg-gray-400' };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.classes}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  }

  const cfg = ORDER_CONFIG[status] ?? { label: status, classes: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
