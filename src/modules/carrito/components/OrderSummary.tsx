import { MapPin, CreditCard, Banknote } from 'lucide-react';
import type { CartItem, Address, PaymentMethod, CartTotals } from '../types/cart.types';

interface Props {
  items: CartItem[];
  direccion: Address | null;
  metodoPago: PaymentMethod | null;
  totales: CartTotals;
}

export default function OrderSummary({ items, direccion, metodoPago, totales }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6 sticky top-20">
      <h3 className="font-extrabold text-gray-900 text-lg">Resumen</h3>

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Productos
        </p>
        <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <img
                src={item.producto.imagen}
                alt={item.producto.nombre}
                className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-1">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {item.producto.nombre}
                  </p>
                  <p className="font-bold text-gray-800 text-sm flex-shrink-0">
                    ${item.subtotal.toFixed(2)}
                  </p>
                </div>
                <p className="text-gray-400 text-xs">
                  x{item.cantidad} · ${item.precioUnitario.toFixed(2)} c/u
                </p>
                {item.personalizacion?.tamano && (
                  <span className="text-xs text-orange-400">{item.personalizacion.tamano}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {direccion && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Entrega en
          </p>
          <div className="flex gap-2.5">
            <MapPin size={15} className="text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-800 text-sm">{direccion.alias}</p>
              <p className="text-gray-500 text-xs leading-snug">{direccion.calle}</p>
              <p className="text-gray-400 text-xs">{direccion.ciudad}</p>
            </div>
          </div>
        </div>
      )}

      {metodoPago && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Método de pago
          </p>
          <div className="flex items-center gap-2.5">
            {metodoPago.tipo === 'tarjeta' ? (
              <CreditCard size={15} className="text-orange-400" />
            ) : (
              <Banknote size={15} className="text-orange-400" />
            )}
            <div>
              <p className="font-semibold text-gray-800 text-sm">{metodoPago.alias}</p>
              {metodoPago.ultimosDigitos && (
                <p className="text-gray-400 text-xs">•••• {metodoPago.ultimosDigitos}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-dashed border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="text-gray-800">${totales.subtotal.toFixed(2)}</span>
        </div>
        {totales.descuento > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Descuento</span>
            <span className="font-semibold text-green-600">−${totales.descuento.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Envío</span>
          <span className={totales.envio === 0 ? 'text-green-600 font-medium' : 'text-gray-800'}>
            {totales.envio === 0 ? 'Gratis' : `$${totales.envio.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between pt-2 border-t border-gray-100">
          <span className="font-extrabold text-gray-900">Total</span>
          <span className="font-extrabold text-orange-500 text-xl">${totales.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
