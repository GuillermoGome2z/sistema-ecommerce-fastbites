import { CreditCard, Banknote, Check } from 'lucide-react';
import type { PaymentMethod } from '../types/cart.types';

interface Props {
  metodo: PaymentMethod;
  seleccionado: boolean;
  onSelect: () => void;
}

export default function PaymentMethodCard({ metodo, seleccionado, onSelect }: Props) {
  const isCard = metodo.tipo === 'tarjeta';

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
        seleccionado
          ? 'border-orange-400 bg-orange-50'
          : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/40'
      }`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
          seleccionado ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
        }`}
      >
        {isCard ? <CreditCard size={22} /> : <Banknote size={22} />}
      </div>

      <div className="flex-1 text-left">
        <p className={`font-bold text-sm ${seleccionado ? 'text-orange-700' : 'text-gray-800'}`}>
          {metodo.alias}
        </p>
        {isCard && metodo.ultimosDigitos ? (
          <p className="text-gray-500 text-xs mt-0.5">
            {metodo.banco} · terminada en {metodo.ultimosDigitos}
          </p>
        ) : (
          <p className="text-gray-500 text-xs mt-0.5">Paga en efectivo al recibir tu pedido</p>
        )}
      </div>

      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          seleccionado ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
        }`}
      >
        {seleccionado && <Check size={11} className="text-white" strokeWidth={3} />}
      </div>
    </button>
  );
}
