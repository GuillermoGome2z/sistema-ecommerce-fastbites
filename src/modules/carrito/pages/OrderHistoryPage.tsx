import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowLeft, Clock, ShoppingBag, ChevronRight } from 'lucide-react';
import OrderStatusBadge from '../components/OrderStatusBadge';
import type { OrderStatus } from '../types/cart.types';
import { API_BASE_URL } from '../../../config/api';

// ── Backend shape ─────────────────────────────────────────────────
interface BackendOrder {
  pedidoId:          number;
  estado:            string;
  tipoEntrega:       string;
  fechaPedido:       string;
  nombreRestaurante: string;
  totalItems:        number;
  subtotal:          number;
  descuento:         number;
  costoEnvio:        number;
  total:             number;
}

// ── Local shape (only what the UI needs) ─────────────────────────
interface PedidoResumen {
  id:           string;
  numeroPedido: string;
  fecha:        string;
  estado:       OrderStatus;
  restaurante:  string;
  totalItems:   number;
  total:        number;
}

function adaptar(o: BackendOrder): PedidoResumen {
  const fecha   = new Date(o.fechaPedido);
  const dateStr = fecha.toISOString().slice(0, 10).replace(/-/g, '');
  return {
    id:           String(o.pedidoId),
    numeroPedido: `FB-${dateStr}-${String(o.pedidoId).padStart(3, '0')}`,
    fecha:        o.fechaPedido,
    estado:       o.estado as OrderStatus,
    restaurante:  o.nombreRestaurante,
    totalItems:   o.totalItems,
    total:        o.total,
  };
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    year:   'numeric',
    month:  'short',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
}

export default function OrderHistoryPage() {
  const [pedidos, setPedidos] = useState<PedidoResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const token = localStorage.getItem('fb_token') ?? '';
    fetch(`${API_BASE_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setPedidos((json.data as BackendOrder[]).map(adaptar));
        } else {
          setError(json.message ?? 'Error al cargar los pedidos.');
        }
      })
      .catch(() => setError('No se pudo conectar con el servidor.'))
      .finally(() => setLoading(false));
  }, []);

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
            {!loading && !error && (
              <p className="text-gray-500 text-sm mt-0.5">
                {pedidos.length} {pedidos.length === 1 ? 'pedido realizado' : 'pedidos realizados'}
              </p>
            )}
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-500 text-sm">Cargando pedidos...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center justify-center py-20">
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-6 py-4 rounded-2xl max-w-md text-center">
              {error}
            </div>
          </div>
        )}

        {!loading && !error && pedidos.length === 0 && (
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
        )}

        {!loading && !error && pedidos.length > 0 && (
          <div className="space-y-4">
            {pedidos.map((pedido) => (
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
                  <span className="text-xs text-gray-600 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
                    {pedido.totalItems} {pedido.totalItems === 1 ? 'producto' : 'productos'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    {pedido.totalItems} {pedido.totalItems === 1 ? 'producto' : 'productos'}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="font-extrabold text-orange-500 text-lg">
                        ${pedido.total.toFixed(2)}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
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
