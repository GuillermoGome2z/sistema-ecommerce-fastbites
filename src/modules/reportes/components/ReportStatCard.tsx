interface ReportStatCardProps {
  label: string;
  value: string;
  icon: string;
  color?: 'orange' | 'red' | 'amber' | 'gray';
  trend?: string;
  trendUp?: boolean;
}

const COLOR_MAP = {
  orange: { bg: 'bg-orange-50', border: 'border-orange-100', icon: 'bg-orange-500', text: 'text-orange-600' },
  red:    { bg: 'bg-red-50',    border: 'border-red-100',    icon: 'bg-red-500',    text: 'text-red-600'    },
  amber:  { bg: 'bg-amber-50',  border: 'border-amber-100',  icon: 'bg-amber-500',  text: 'text-amber-600'  },
  gray:   { bg: 'bg-gray-50',   border: 'border-gray-100',   icon: 'bg-gray-700',   text: 'text-gray-600'   },
};

export default function ReportStatCard({ label, value, icon, color = 'orange', trend, trendUp }: ReportStatCardProps) {
  const c = COLOR_MAP[color];
  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-5 shadow-sm flex items-start gap-4`}>
      <div className={`${c.icon} w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-extrabold text-gray-900 mt-0.5 leading-tight">{value}</p>
        {trend && (
          <p className={`text-xs mt-1 font-semibold ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
            {trendUp ? '▲' : '▼'} {trend}
          </p>
        )}
      </div>
    </div>
  );
}
