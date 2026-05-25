interface BarData {
  label: string;
  value: number;
  sublabel?: string;
}

interface ReportChartCardProps {
  title: string;
  data: BarData[];
  color?: 'orange' | 'amber' | 'red';
  formatValue?: (v: number) => string;
  maxItems?: number;
}

const BAR_COLOR = {
  orange: { bar: 'bg-orange-500', light: 'bg-orange-100', text: 'text-orange-600' },
  amber:  { bar: 'bg-amber-500',  light: 'bg-amber-100',  text: 'text-amber-600'  },
  red:    { bar: 'bg-red-500',    light: 'bg-red-100',    text: 'text-red-600'    },
};

export default function ReportChartCard({ title, data, color = 'orange', formatValue, maxItems = 10 }: ReportChartCardProps) {
  const c = BAR_COLOR[color];
  const visible = data.slice(0, maxItems);
  const max = Math.max(...visible.map((d) => d.value), 1);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
      <h3 className="font-bold text-gray-900 mb-4 text-sm">{title}</h3>
      <div className="space-y-2.5">
        {visible.map((d, i) => {
          const pct = Math.round((d.value / max) * 100);
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-20 flex-shrink-0 truncate text-right leading-tight">{d.label}</span>
              <div className="flex-1 h-6 rounded-lg overflow-hidden bg-gray-100 relative">
                <div
                  className={`h-full ${c.bar} rounded-lg transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className={`text-xs font-bold ${c.text} w-20 flex-shrink-0`}>
                {formatValue ? formatValue(d.value) : d.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
