import { Link } from 'react-router-dom';
import { Package, ArrowLeft, Clock, ShoppingBag, ChevronRight } from 'lucide-react';
import { PEDIDOS_MOCK } from '../data/pedidos.mock';
import OrderStatusBadge from '../components/OrderStatusBadge';

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderHistoryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">FB</span>
              </div>
              <span className="font-black text-xl text-gray-900">
                Fast<span className="text-orange-500">Bites</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/carrito"
                className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 text-sm font-medium transition-colors"
              >
                <ShoppingBag size={15} />
                <span className="hidden sm:inline">Carrito</span>
              </Link>
              <Link
                to="/"
                className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 text-sm font-medium transition-colors"
              >
                <ArrowLeft size={15} />
                <span className="hidden sm:inline">Inicio</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Package size={28} className="text-orange-500" />
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Mis Pedidos</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {PEDIDOS_MOCK.length} pedidos realizados
            </p>
          </div>
        </div>

        {PEDIDOS_MOCK.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-5">
              <Package size={36} className="text-orange-300" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-800 mb-2">Aún no tienes pedidos</h2>
            <p className="text-gray-500 mb-6">¡Haz tu primer pedido y disfruta de FastBites!</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-2xl transition-colors shadow-lg shadow-orange-100"
            >
              Ver Menú
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {PEDIDOS_MOCK.map((pedido) => {
              const totalProductos = pedido.productos.reduce((s, p) => s + p.cantidad, 0);
              return (
                <div
                  key={pedido.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="font-extrabold text-gray-900">#{pedido.numeroPedido}</p>
                      <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                        <Clock size={11} />
                        {formatFecha(pedido.fecha)}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">{pedido.restaurante}</p>
                    </div>
                    <OrderStatusBadge estado={pedido.estado} />
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {pedido.productos.slice(0, 3).map((p, i) => (
                      <span
                        key={i}
                        className="text-xs text-gray-600 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg"
                      >
                        x{p.cantidad} {p.nombre}
                      </span>
                    ))}
                    {pedido.productos.length > 3 && (
                      <span className="text-xs text-gray-400 px-2.5 py-1">
                        +{pedido.productos.length - 3} más
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      {totalProductos} {totalProductos === 1 ? 'producto' : 'productos'}
                      {pedido.metodoPago.tipo === 'tarjeta' && pedido.metodoPago.ultimosDigitos && (
                        <span className="ml-2">· Visa •••• {pedido.metodoPago.ultimosDigitos}</span>
                      )}
                      {pedido.metodoPago.tipo === 'efectivo' && (
                        <span className="ml-2">· Efectivo</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="font-extrabold text-orange-500 text-lg">
                          ${pedido.totales.total.toFixed(2)}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/carrito"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-2xl transition-colors shadow-lg shadow-orange-100"
          >
            <ShoppingBag size={16} />
            Hacer nuevo pedido
          </Link>
        </div>
      </div>
    </div>
  );
}
