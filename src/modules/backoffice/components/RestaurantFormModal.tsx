import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { AdminRestaurant } from '../types/backoffice.types';

interface Props {
  open: boolean;
  onClose: () => void;
  restaurant?: AdminRestaurant | null;
  onSave: (data: Partial<AdminRestaurant>) => void;
}

export default function RestaurantFormModal({ open, onClose, restaurant, onSave }: Props) {
  const [form, setForm] = useState({ nombre: '', direccion: '', ciudad: '', telefono: '', activo: true });

  useEffect(() => {
    if (restaurant) {
      setForm({ nombre: restaurant.nombre, direccion: restaurant.direccion, ciudad: restaurant.ciudad, telefono: restaurant.telefono, activo: restaurant.activo });
    } else {
      setForm({ nombre: '', direccion: '', ciudad: '', telefono: '', activo: true });
    }
  }, [restaurant, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900">{restaurant ? 'Editar Restaurante' : 'Nuevo Restaurante'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {[
            { label: 'Nombre', key: 'nombre', placeholder: 'FastBites Sucursal' },
            { label: 'Dirección', key: 'direccion', placeholder: 'Calle y número' },
            { label: 'Ciudad', key: 'ciudad', placeholder: 'Ciudad de México' },
            { label: 'Teléfono', key: 'telefono', placeholder: '+52 55 0000-0000' },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">{f.label}</label>
              <input
                required
                value={form[f.key as keyof typeof form] as string}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors"
                placeholder={f.placeholder}
              />
            </div>
          ))}
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
            <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} className="w-4 h-4 accent-orange-500" />
            Restaurante activo
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-gray-300 font-medium text-sm transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
