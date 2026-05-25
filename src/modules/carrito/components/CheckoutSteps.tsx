import { Check } from 'lucide-react';
import type { CheckoutStep } from '../types/cart.types';

const STEPS: { id: CheckoutStep; label: string; emoji: string }[] = [
  { id: 'carrito', label: 'Carrito', emoji: '🛒' },
  { id: 'direccion', label: 'Dirección', emoji: '📍' },
  { id: 'pago', label: 'Pago', emoji: '💳' },
  { id: 'confirmacion', label: 'Confirmar', emoji: '✓' },
];

const STEP_INDEX: Record<CheckoutStep, number> = {
  carrito: 0,
  direccion: 1,
  pago: 2,
  confirmacion: 3,
};

interface Props {
  currentStep: CheckoutStep;
}

export default function CheckoutSteps({ currentStep }: Props) {
  const currentIndex = STEP_INDEX[currentStep];

  return (
    <div className="flex items-center justify-center">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                  isCompleted
                    ? 'bg-orange-500 text-white'
                    : isActive
                    ? 'bg-orange-500 text-white ring-4 ring-orange-100'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isCompleted ? <Check size={16} strokeWidth={3} /> : step.emoji}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block transition-colors ${
                  isActive
                    ? 'text-orange-500'
                    : isCompleted
                    ? 'text-gray-600'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-10 sm:w-16 mx-2 mb-5 transition-all duration-300 ${
                  index < currentIndex ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
