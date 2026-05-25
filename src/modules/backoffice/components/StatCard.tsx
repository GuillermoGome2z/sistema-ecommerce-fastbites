import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconBg: string;
  trend?: { value: string; positive: boolean };
  sub?: string;
}

export default function StatCard({ label, value, icon, iconBg, trend, sub }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-500 text-sm mb-0.5 truncate">{label}</p>
        <p className="text-2xl font-extrabold text-gray-900 leading-tight">{value}</p>
        {trend && (
          <p className={`text-xs mt-0.5 font-medium ${trend.positive ? 'text-green-600' : 'text-red-500'}`}>
            {trend.positive ? '▲' : '▼'} {trend.value}
          </p>
        )}
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
