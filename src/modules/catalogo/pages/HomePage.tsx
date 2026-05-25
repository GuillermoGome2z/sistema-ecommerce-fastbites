import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Star, Truck, Clock } from 'lucide-react';
import FeaturedProducts from '../components/FeaturedProducts';
import CategoryCard from '../components/CategoryCard';
import { PRODUCTOS_MOCK, CATEGORIAS } from '../data/productos.mock';
import type { Categoria } from '../types/product.types';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
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
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-orange-500 font-semibold text-sm">
                Inicio
              </Link>
              <Link to="/productos" className="text-gray-700 hover:text-orange-500 font-medium text-sm transition-colors">
                Menú
              </Link>
            </div>
            <Link
              to="/productos"
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              <ShoppingBag size={16} />
              Ver Menú
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-20 w-72 h-72 bg-yellow-300 rounded-full blur-3xl opacity-20" />
          <div className="absolute -bottom-10 left-10 w-56 h-56 bg-red-300 rounded-full blur-3xl opacity-20" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              🔥 Entrega en 30 minutos
            </span>
            <h1 className="text-5xl lg:text-6xl font-black leading-tight mb-6">
              Sabor que te
              <br />
              <span className="text-yellow-300">Conquista</span>
            </h1>
            <p className="text-orange-100 text-lg mb-8 max-w-lg">
              Hamburguesas jugosas, pizzas artesanales y más. Preparados con los mejores ingredientes
              para darte la mejor experiencia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/productos"
                className="flex items-center justify-center gap-2 bg-white text-orange-600 font-bold px-8 py-3.5 rounded-2xl hover:bg-yellow-50 transition-colors shadow-lg text-base"
              >
                Ordenar Ahora
                <ChevronRight size={20} />
              </Link>
              <Link
                to="/productos"
                className="flex items-center justify-center gap-2 border-2 border-white/50 text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-white/10 transition-colors text-base"
              >
                Ver Menú Completo
              </Link>
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl" />
              <img
                src="https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80"
                alt="FastBites — hamburguesa premium"
                className="relative w-full h-full object-cover rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative border-t border-white/20 bg-black/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-3 divide-x divide-white/20">
            {[
              { icon: <Star size={16} />, value: '4.9', label: 'Calificación' },
              { icon: <Truck size={16} />, value: 'Gratis', label: 'Envío +$30' },
              { icon: <Clock size={16} />, value: '30 min', label: 'Entrega' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-1 px-4">
                <div className="flex items-center gap-1.5 text-yellow-300">
                  {stat.icon}
                  <span className="font-black text-lg">{stat.value}</span>
                </div>
                <span className="text-orange-200 text-xs">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900">Explora Nuestro Menú</h2>
          <p className="text-gray-500 mt-2">Encuentra exactamente lo que se te antoja</p>
        </div>
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          {CATEGORIAS.map((cat) => {
            const conteo = PRODUCTOS_MOCK.filter((p) => p.categoria === cat && p.activo).length;
            return (
              <CategoryCard
                key={cat}
                categoria={cat as Categoria}
                activa={false}
                conteo={conteo}
                onClick={() => navigate(`/productos?categoria=${cat}`)}
              />
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FeaturedProducts />
      </div>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 text-white mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h2 className="text-3xl font-extrabold mb-3">¿Listo para ordenar?</h2>
          <p className="text-orange-100 mb-8 max-w-md mx-auto">
            Más de 8 opciones esperándote. Rápido, delicioso y a domicilio.
          </p>
          <Link
            to="/productos"
            className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-8 py-3.5 rounded-2xl hover:bg-yellow-50 transition-colors shadow-lg"
          >
            Ver Menú Completo
            <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">FB</span>
            </div>
            <span className="font-black text-lg text-white">
              Fast<span className="text-orange-500">Bites</span>
            </span>
          </div>
          <p className="text-sm">© 2025 FastBites. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
