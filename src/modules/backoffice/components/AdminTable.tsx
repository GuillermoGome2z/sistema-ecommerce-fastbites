import type { ReactNode } from 'react';

interface Props {
  headers: string[];
  rows: ReactNode[][];
  emptyMessage?: string;
  onRowClick?: (index: number) => void;
}

export default function AdminTable({ headers, rows, emptyMessage = 'Sin datos disponibles', onRowClick }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-4 py-12 text-center text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, ri) => (
                <tr
                  key={ri}
                  onClick={() => onRowClick?.(ri)}
                  className={`border-b border-gray-50 last:border-0 transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-orange-50/40' : 'hover:bg-gray-50/60'
                  }`}
                >
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
