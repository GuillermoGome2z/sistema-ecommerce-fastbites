import { Plus, Minus, Trash2 } from 'lucide-react';
import type { CartItem as CartItemType } from '../types/cart.types';

interface Props {
  item: CartItemType;
  onIncrement: () => void;
  onDecrement: () => void;
  onDelete: () => void;
}

export default function CartItemCard({ item, onIncrement, onDecrement, onDelete }: Props) {
  const { producto, cantidad, precioUnitario, subtotal, personalizacion } = item;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition-shadow">
      <img
        src={producto.imagen}
        alt={producto.nombre}
        className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate">{producto.nombre}</p>
            <p className="text-orange-500 text-xs font-medium mt-0.5">{producto.categoria}</p>
          </div>
          <button
            onClick={onDelete}
            className="text-gray-300 hover:text-red-400 transition-colors p-1 flex-shrink-0 rounded-lg hover:bg-red-50"
            aria-label="Eliminar producto"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {personalizacion && (
          <div className="mt-2 flex flex-wrap gap-1">
            {personalizacion.tamano && (
              <span className="text-xs bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full font-medium">
                {personalizacion.tamano}
              </span>
            )}
            {personalizacion.bebida && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                🥤 {personalizacion.bebida}
              </span>
            )}
            {personalizacion.complementos?.map((c) => (
              <span key={c} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                + {c}
              </span>
            ))}
            {personalizacion.ingredientesAdicionales?.map((ing) => (
              <span key={ing} className="text-xs bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full">
                + {ing}
              </span>
            ))}
            {personalizacion.notas && (
              <span className="text-xs bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full italic w-full mt-0.5">
                "{personalizacion.notas}"
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onDecrement}
              disabled={cantidad <= 1}
              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:border-orange-300 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <Minus size={12} />
            </button>
            <span className="w-6 text-center font-bold text-gray-900 text-sm">{cantidad}</span>
            <button
              onClick={onIncrement}
              className="w-7 h-7 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-400">${precioUnitario.toFixed(2)} c/u</p>
            <p className="font-extrabold text-orange-500 text-base">${subtotal.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
