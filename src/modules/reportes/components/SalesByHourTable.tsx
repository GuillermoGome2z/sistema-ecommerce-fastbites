import type { VentaPorHora } from '../types/reportes.types';

interface Props {
  data: VentaPorHora[];
}

function formatHora(h: number) {
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:00 ${suffix}`;
}

export default function SalesByHourTable({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 text-center text-gray-400 text-sm">
        No hay datos para los filtros seleccionados.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Fecha', 'Hora', 'Restaurante', 'Pedidos', 'Total Ventas'].map((h) => (
                <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-5 py-3.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-orange-50/40 transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-gray-600">{row.Fecha}</td>
                <td className="px-5 py-3">
                  <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    {formatHora(row.Hora)}
                  </span>
                </td>
                <td className="px-5 py-3 font-semibold text-gray-800">{row.Restaurante}</td>
                <td className="px-5 py-3 text-center font-bold text-gray-700">{row.TotalPedidos}</td>
                <td className="px-5 py-3 font-extrabold text-orange-500">${row.TotalVentas.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t border-gray-200">
              <td className="px-5 py-3 font-bold text-gray-700 text-xs uppercase" colSpan={3}>Total</td>
              <td className="px-5 py-3 font-extrabold text-gray-800 text-center">{data.reduce((s, r) => s + r.TotalPedidos, 0)}</td>
              <td className="px-5 py-3 font-extrabold text-orange-600 text-base">${data.reduce((s, r) => s + r.TotalVentas, 0).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
