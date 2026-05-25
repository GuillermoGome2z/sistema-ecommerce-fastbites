import { useNavigate } from 'react-router-dom';
import { ArrowRight, Tag, Truck } from 'lucide-react';
import type { CartTotals } from '../types/cart.types';

interface Props {
  totales: CartTotals;
  itemCount: number;
}

export default function CartSummary({ totales, itemCount }: Props) {
  const navigate = useNavigate();
  const faltaParaEnvioGratis = 30 - totales.subtotal;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-20">
      <h2 className="font-extrabold text-gray-900 text-lg mb-5">Resumen del pedido</h2>

      {totales.descuento > 0 && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2.5 mb-4">
          <Tag size={14} className="text-green-500 flex-shrink-0" />
          <span className="text-green-700 text-sm font-medium">
            ¡Descuento del 10% aplicado!
          </span>
        </div>
      )}

      {totales.envio > 0 && faltaParaEnvioGratis > 0 && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 mb-4">
          <Truck size={14} className="text-blue-500 flex-shrink-0" />
          <span className="text-blue-700 text-sm">
            Agrega <strong>${faltaParaEnvioGratis.toFixed(2)}</strong> más para envío gratis
          </span>
        </div>
      )}

      <div className="space-y-3 mb-5">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          <span className="font-medium text-gray-800">${totales.subtotal.toFixed(2)}</span>
        </div>
        {totales.descuento > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Descuento</span>
            <span className="font-semibold text-green-600">−${totales.descuento.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Envío</span>
          <span className={`font-medium ${totales.envio === 0 ? 'text-green-600' : 'text-gray-800'}`}>
            {totales.envio === 0 ? '¡Gratis!' : `$${totales.envio.toFixed(2)}`}
          </span>
        </div>
        <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between">
          <span className="font-extrabold text-gray-900 text-base">Total</span>
          <span className="font-extrabold text-orange-500 text-2xl">${totales.total.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={() => navigate('/checkout')}
        disabled={itemCount === 0}
        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-orange-100"
      >
        Continuar al Checkout
        <ArrowRight size={18} />
      </button>

      <p className="text-center text-gray-500 text-xs mt-3">
        🔒 Pago seguro y protegido
      </p>
    </div>
  );
}
