import { useParams, Link } from 'react-router-dom';
import { CheckCircle, MapPin, CreditCard, Banknote, Clock, Package } from 'lucide-react';
import { useCarrito } from '../CarritoContext';
import OrderStatusBadge from '../components/OrderStatusBadge';

export default function OrderConfirmationPage() {
  const { numero } = useParams();
  const { lastOrder } = useCarrito();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">FB</span>
            </div>
            <span className="font-black text-xl text-gray-900">
              Fast<span className="text-orange-500">Bites</span>
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="relative inline-flex mb-8">
          <div className="absolute inset-0 bg-green-100 rounded-full blur-2xl opacity-70 animate-pulse" />
          <div className="relative w-28 h-28 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-200">
            <CheckCircle size={56} className="text-white" strokeWidth={1.8} />
          </div>
        </div>

        <h1 className="text-4xl font-black text-gray-900 mb-3">¡Pedido Confirmado!</h1>
        <p className="text-gray-500 text-lg mb-2">
          Tu pedido está siendo preparado con amor.
        </p>

        <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 px-5 py-2.5 rounded-full mb-8">
          <Package size={16} className="text-orange-500" />
          <span className="text-orange-700 font-bold text-sm">
            Pedido #{numero ?? lastOrder?.numeroPedido ?? '—'}
          </span>
        </div>

        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-7 text-left mb-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-gray-900 text-lg">Estado actual</h2>
            <OrderStatusBadge estado="Confirmado" />
          </div>

          <div className="space-y-3">
            {[
              { emoji: '✅', label: 'Pedido recibido', done: true },
              { emoji: '👨‍🍳', label: 'En preparación', done: false },
              { emoji: '🛵', label: 'En camino', done: false },
              { emoji: '🏠', label: 'Entregado', done: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 ${
                    s.done
                      ? 'bg-green-50 border-2 border-green-400'
                      : 'bg-gray-50 border-2 border-gray-200'
                  }`}
                >
                  {s.emoji}
                </div>
                <span
                  className={`font-medium text-sm ${s.done ? 'text-green-700' : 'text-gray-400'}`}
                >
                  {s.label}
                </span>
                {s.done && (
                  <span className="text-green-500 text-xs ml-auto">Ahora</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-gray-500 pt-2 border-t border-dashed border-gray-200">
            <Clock size={15} className="text-orange-400" />
            <p className="text-sm">
              Tiempo estimado:{' '}
              <strong className="text-gray-700">25–35 minutos</strong>
            </p>
          </div>

          {lastOrder && (
            <>
              {lastOrder.direccion && (
                <div className="flex gap-2.5 pt-2 border-t border-dashed border-gray-200">
                  <MapPin size={15} className="text-orange-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Entregando en</p>
                    <p className="font-semibold text-gray-800 text-sm">
                      {lastOrder.direccion.alias}
                    </p>
                    <p className="text-gray-500 text-xs">{lastOrder.direccion.calle}</p>
                  </div>
                </div>
              )}

              {lastOrder.metodoPago && (
                <div className="flex gap-2.5 pt-2 border-t border-dashed border-gray-200">
                  {lastOrder.metodoPago.tipo === 'tarjeta' ? (
                    <CreditCard size={15} className="text-orange-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Banknote size={15} className="text-orange-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Pagando con</p>
                    <p className="font-semibold text-gray-800 text-sm">
                      {lastOrder.metodoPago.alias}
                    </p>
                    {lastOrder.metodoPago.ultimosDigitos && (
                      <p className="text-gray-400 text-xs">
                        •••• {lastOrder.metodoPago.ultimosDigitos}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-orange-50 rounded-2xl px-4 py-3 flex justify-between items-center">
                <span className="font-semibold text-gray-700">Total pagado</span>
                <span className="font-extrabold text-orange-500 text-xl">
                  ${lastOrder.totales.total.toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/pedidos"
            className="flex items-center justify-center gap-2 border-2 border-orange-200 text-orange-600 hover:bg-orange-50 font-semibold px-6 py-3 rounded-2xl transition-colors"
          >
            <Package size={16} />
            Ver Mis Pedidos
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-2xl transition-colors shadow-lg shadow-orange-100"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
