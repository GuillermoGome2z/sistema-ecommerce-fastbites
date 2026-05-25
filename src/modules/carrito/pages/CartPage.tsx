import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Package } from 'lucide-react';
import { useCarrito } from '../CarritoContext';
import CartItemCard from '../components/CartItem';
import CartSummary from '../components/CartSummary';

export default function CartPage() {
  const { items, totales, incrementar, decrementar, eliminar } = useCarrito();
  const totalItems = items.reduce((s, i) => s + i.cantidad, 0);

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
                to="/"
                className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 text-sm font-medium transition-colors"
              >
                <ArrowLeft size={15} />
                <span className="hidden sm:inline">Seguir comprando</span>
              </Link>
              <Link
                to="/pedidos"
                className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 text-sm font-medium transition-colors"
              >
                <Package size={15} />
                <span className="hidden sm:inline">Mis Pedidos</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag size={28} className="text-orange-500" />
          <h1 className="text-3xl font-extrabold text-gray-900">Mi Carrito</h1>
          {totalItems > 0 && (
            <span className="bg-orange-500 text-white text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag size={40} className="text-orange-300" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-500 mb-8 max-w-sm">
              ¡Agrega algo delicioso y te lo llevamos en menos de 30 minutos!
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-2xl transition-colors shadow-lg shadow-orange-100"
            >
              Explorar Menú
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onIncrement={() => incrementar(item.id)}
                  onDecrement={() => decrementar(item.id)}
                  onDelete={() => eliminar(item.id)}
                />
              ))}
            </div>
            <div>
              <CartSummary totales={totales} itemCount={totalItems} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
