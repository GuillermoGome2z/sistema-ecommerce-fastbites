import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X } from 'lucide-react';

interface Props {
  nombre: string;
  onClose: () => void;
}

export default function CartAddedToast({ nombre, onClose }: Props) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm px-4 transition-all duration-300 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="h-1 bg-orange-500" />

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShoppingCart size={20} className="text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm">¡Agregado al carrito!</p>
              <p className="text-gray-500 text-xs mt-0.5 truncate">{nombre}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={onClose}
              className="flex-1 text-sm font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 py-2 rounded-xl transition-colors"
            >
              Seguir comprando
            </button>
            <button
              onClick={() => { onClose(); navigate('/carrito'); }}
              className="flex-1 flex items-center justify-center gap-1.5 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 py-2 rounded-xl transition-colors"
            >
              <ShoppingCart size={14} />
              Ver carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
