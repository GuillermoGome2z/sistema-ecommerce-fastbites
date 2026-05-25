import type { Categoria } from '../types/product.types';

interface Props {
  categoria: Categoria;
  activa: boolean;
  conteo: number;
  onClick: () => void;
}

const CONFIG: Record<Categoria, { emoji: string; textActivo: string; bgInactivo: string; textInactivo: string }> = {
  Desayuno: {
    emoji: '🌅',
    textActivo: 'text-white',
    bgInactivo: 'bg-amber-50 border-amber-200 hover:border-amber-400',
    textInactivo: 'text-amber-700',
  },
  Almuerzo: {
    emoji: '🍔',
    textActivo: 'text-white',
    bgInactivo: 'bg-orange-50 border-orange-200 hover:border-orange-400',
    textInactivo: 'text-orange-700',
  },
  Cena: {
    emoji: '🍕',
    textActivo: 'text-white',
    bgInactivo: 'bg-red-50 border-red-200 hover:border-red-400',
    textInactivo: 'text-red-700',
  },
};

export default function CategoryCard({ categoria, activa, conteo, onClick }: Props) {
  const c = CONFIG[categoria];

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all duration-200 w-full hover:scale-105 hover:shadow-md ${
        activa
          ? 'bg-orange-500 border-orange-500 shadow-lg shadow-orange-200 scale-105'
          : `${c.bgInactivo}`
      }`}
    >
      <span className="text-3xl">{c.emoji}</span>
      <span className={`font-bold text-sm ${activa ? c.textActivo : c.textInactivo}`}>
        {categoria}
      </span>
      <span className={`text-xs ${activa ? 'text-white/80' : 'text-gray-500'}`}>
        {conteo} productos
      </span>
    </button>
  );
}
