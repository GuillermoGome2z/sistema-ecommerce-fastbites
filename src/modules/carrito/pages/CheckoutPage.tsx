import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import type { CheckoutStep } from '../types/cart.types';
import { useCarrito } from '../CarritoContext';
import CheckoutSteps from '../components/CheckoutSteps';
import AddressCard from '../components/AddressCard';
import PaymentMethodCard from '../components/PaymentMethodCard';
import OrderSummary from '../components/OrderSummary';

const STEP_TITLES: Record<CheckoutStep, string> = {
  carrito: 'Revisa tu pedido',
  direccion: '¿Dónde entregamos?',
  pago: '¿Cómo pagas?',
  confirmacion: 'Confirmar pedido',
};

const STEP_BUTTONS: Record<CheckoutStep, string> = {
  carrito: 'Elegir dirección',
  direccion: 'Elegir método de pago',
  pago: 'Revisar pedido',
  confirmacion: 'Confirmar pedido',
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const {
    items,
    direcciones,
    metodosPago,
    selectedAddress,
    selectedPayment,
    totales,
    setSelectedAddress,
    setSelectedPayment,
    confirmarPedido,
  } = useCarrito();

  const [step, setStep] = useState<CheckoutStep>('carrito');
  const [error, setError] = useState('');

  const handleNext = () => {
    setError('');
    if (step === 'carrito') {
      setStep('direccion');
    } else if (step === 'direccion') {
      if (!selectedAddress) {
        setError('Selecciona una dirección de entrega para continuar.');
        return;
      }
      setStep('pago');
    } else if (step === 'pago') {
      if (!selectedPayment) {
        setError('Selecciona un método de pago para continuar.');
        return;
      }
      setStep('confirmacion');
    } else if (step === 'confirmacion') {
      const numero = confirmarPedido();
      navigate(`/confirmacion/${numero}`);
    }
  };

  const handleBack = () => {
    setError('');
    if (step === 'direccion') setStep('carrito');
    else if (step === 'pago') setStep('direccion');
    else if (step === 'confirmacion') setStep('pago');
  };

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
            <button
              onClick={() => navigate('/carrito')}
              className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 text-sm font-medium transition-colors"
            >
              <ArrowLeft size={15} />
              Volver al carrito
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Checkout</h1>
        <CheckoutSteps currentStep={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-extrabold text-gray-900 text-lg mb-5">
                {STEP_TITLES[step]}
              </h2>

              {step === 'carrito' && (
                <div className="space-y-3">
                  {items.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">
                      Tu carrito está vacío.
                    </p>
                  ) : (
                    items.map((item) => (
                      <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                        <img
                          src={item.producto.imagen}
                          alt={item.producto.nombre}
                          className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-2">
                            <p className="font-bold text-gray-900 text-sm truncate">
                              {item.producto.nombre}
                            </p>
                            <p className="font-bold text-orange-500 text-sm flex-shrink-0">
                              ${item.subtotal.toFixed(2)}
                            </p>
                          </div>
                          <p className="text-gray-500 text-xs mt-0.5">x{item.cantidad}</p>
                          {(item.personalizacion?.tamano || item.personalizacion?.bebida) && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {item.personalizacion?.tamano && (
                                <span className="text-xs bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full">
                                  {item.personalizacion.tamano}
                                </span>
                              )}
                              {item.personalizacion?.bebida && (
                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                  🥤 {item.personalizacion.bebida}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {step === 'direccion' && (
                <div className="space-y-3">
                  {direcciones.map((dir) => (
                    <AddressCard
                      key={dir.id}
                      direccion={dir}
                      seleccionada={selectedAddress?.id === dir.id}
                      onSelect={() => {
                        setSelectedAddress(dir);
                        setError('');
                      }}
                    />
                  ))}
                </div>
              )}

              {step === 'pago' && (
                <div className="space-y-3">
                  {metodosPago.map((mp) => (
                    <PaymentMethodCard
                      key={mp.id}
                      metodo={mp}
                      seleccionado={selectedPayment?.id === mp.id}
                      onSelect={() => {
                        setSelectedPayment(mp);
                        setError('');
                      }}
                    />
                  ))}
                </div>
              )}

              {step === 'confirmacion' && (
                <div className="bg-orange-50 rounded-2xl p-5 text-center space-y-2">
                  <p className="text-4xl">🎉</p>
                  <p className="text-orange-800 font-semibold">
                    Revisa los detalles y confirma tu pedido.
                  </p>
                  <p className="text-orange-500 text-sm">
                    ⏱ Tiempo estimado de entrega: <strong>25–35 minutos</strong>
                  </p>
                </div>
              )}

              {error && (
                <div className="mt-4 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div
                className={`flex mt-6 gap-3 ${step !== 'carrito' ? 'justify-between' : 'justify-end'}`}
              >
                {step !== 'carrito' && (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500 font-medium text-sm transition-all"
                  >
                    <ArrowLeft size={15} />
                    Atrás
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={items.length === 0}
                  className={`flex items-center gap-2 font-bold px-6 py-2.5 rounded-xl transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                    step === 'confirmacion'
                      ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-100'
                      : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-100'
                  }`}
                >
                  {STEP_BUTTONS[step]}
                  <ArrowRight size={15} />
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 mt-4 text-gray-500 text-xs">
                <ShieldCheck size={13} className="text-green-500" />
                Transacción segura y cifrada
              </div>
            </div>
          </div>

          <div>
            <OrderSummary
              items={items}
              direccion={selectedAddress}
              metodoPago={selectedPayment}
              totales={totales}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
