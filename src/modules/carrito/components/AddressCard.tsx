import { MapPin, Check } from 'lucide-react';
import type { Address } from '../types/cart.types';

interface Props {
  direccion: Address;
  seleccionada: boolean;
  onSelect: () => void;
}

export default function AddressCard({ direccion, seleccionada, onSelect }: Props) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-4 ${
        seleccionada
          ? 'border-orange-400 bg-orange-50'
          : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/40'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
          seleccionada ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
        }`}
      >
        <MapPin size={18} />
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <p className={`font-bold text-sm ${seleccionada ? 'text-orange-700' : 'text-gray-800'}`}>
            {direccion.alias}
          </p>
          {direccion.esPrincipal && (
            <span className="text-xs bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full font-medium">
              Principal
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm leading-snug">{direccion.calle}</p>
        <p className="text-gray-500 text-xs mt-0.5">
          {direccion.ciudad} · CP {direccion.codigoPostal}
        </p>
        {direccion.referencias && (
          <p className="text-gray-500 text-xs mt-0.5 italic">{direccion.referencias}</p>
        )}
      </div>

      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all mt-0.5 ${
          seleccionada ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
        }`}
      >
        {seleccionada && <Check size={11} className="text-white" strokeWidth={3} />}
      </div>
    </button>
  );
}
