import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Plus, Pencil, Trash2, Star } from 'lucide-react';
import { API_BASE_URL } from '../../../config/api';

// ── Shapes ───────────────────────────────────────────────────────
interface Direccion {
  DireccionId:     number;
  Alias:           string;
  Calle:           string;
  NumeroExterior:  string | null;
  NumeroInterior:  string | null;
  Colonia:         string | null;
  Ciudad:          string;
  Estado:          string;
  CodigoPostal:    string;
  Referencias:     string | null;
  EsPrincipal:     boolean;
}

interface FormState {
  alias:          string;
  calle:          string;
  numeroExterior: string;
  numeroInterior: string;
  colonia:        string;
  ciudad:         string;
  estado:         string;
  codigoPostal:   string;
  referencias:    string;
  esPrincipal:    boolean;
}

const FORM_EMPTY: FormState = {
  alias: '', calle: '', numeroExterior: '', numeroInterior: '',
  colonia: '', ciudad: '', estado: '', codigoPostal: '',
  referencias: '', esPrincipal: false,
};

function getHeaders() {
  return {
    Authorization:  `Bearer ${localStorage.getItem('fb_token') ?? ''}`,
    'Content-Type': 'application/json',
  };
}

export default function MisDireccionesPage() {
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [showForm, setShowForm]       = useState(false);
  const [editingId, setEditingId]     = useState<number | null>(null);
  const [form, setForm]               = useState<FormState>(FORM_EMPTY);
  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState('');

  function cargar() {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/customers/me/addresses`, { headers: getHeaders() })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setDirecciones(json.data as Direccion[]);
        else setError(json.message ?? 'Error al cargar direcciones.');
      })
      .catch(() => setError('No se pudo conectar con el servidor.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { cargar(); }, []);

  function abrirAgregar() {
    setEditingId(null);
    setForm(FORM_EMPTY);
    setSaveError('');
    setShowForm(true);
  }

  function abrirEditar(d: Direccion) {
    setEditingId(d.DireccionId);
    setForm({
      alias:          d.Alias,
      calle:          d.Calle,
      numeroExterior: d.NumeroExterior ?? '',
      numeroInterior: d.NumeroInterior ?? '',
      colonia:        d.Colonia ?? '',
      ciudad:         d.Ciudad,
      estado:         d.Estado,
      codigoPostal:   d.CodigoPostal,
      referencias:    d.Referencias ?? '',
      esPrincipal:    d.EsPrincipal,
    });
    setSaveError('');
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.alias || !form.calle || !form.ciudad || !form.estado || !form.codigoPostal) {
      setSaveError('Alias, calle, ciudad, estado y código postal son obligatorios.');
      return;
    }
    setSaving(true);
    setSaveError('');

    const url    = editingId
      ? `${API_BASE_URL}/api/customers/me/addresses/${editingId}`
      : `${API_BASE_URL}/api/customers/me/addresses`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const r    = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(form) });
      const json = await r.json();
      if (json.success) {
        setShowForm(false);
        cargar();
      } else {
        setSaveError(json.message ?? 'Error al guardar.');
      }
    } catch {
      setSaveError('Error de conexión.');
    } finally {
      setSaving(false);
    }
  }

  async function handleEliminar(id: number) {
    if (!window.confirm('¿Eliminar esta dirección?')) return;
    try {
      const r    = await fetch(`${API_BASE_URL}/api/customers/me/addresses/${id}`, {
        method: 'DELETE', headers: getHeaders(),
      });
      const json = await r.json();
      if (json.success) cargar();
      else setError(json.message ?? 'Error al eliminar.');
    } catch {
      setError('Error de conexión.');
    }
  }

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
            <Link
              to="/mi-cuenta"
              className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 text-sm font-medium transition-colors"
            >
              <ArrowLeft size={15} />
              Mi Cuenta
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <MapPin size={28} className="text-orange-500" />
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Mis Direcciones</h1>
              {!loading && !error && (
                <p className="text-gray-500 text-sm mt-0.5">{direcciones.length} dirección{direcciones.length !== 1 ? 'es' : ''} guardada{direcciones.length !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
          {!showForm && (
            <button
              onClick={abrirAgregar}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors shadow-md shadow-orange-100"
            >
              <Plus size={15} />
              Agregar
            </button>
          )}
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 mb-6">
            <h3 className="font-extrabold text-gray-900 mb-4">
              {editingId ? 'Editar dirección' : 'Nueva dirección'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Alias *</label>
                <input
                  type="text" placeholder="Ej: Casa, Oficina..."
                  value={form.alias}
                  onChange={(e) => setForm({ ...form, alias: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Calle *</label>
                <input
                  type="text" placeholder="Ej: Av. Insurgentes Sur"
                  value={form.calle}
                  onChange={(e) => setForm({ ...form, calle: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Número Ext.</label>
                <input
                  type="text" placeholder="Ej: 1234"
                  value={form.numeroExterior}
                  onChange={(e) => setForm({ ...form, numeroExterior: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Número Int.</label>
                <input
                  type="text" placeholder="Ej: Depto 3B"
                  value={form.numeroInterior}
                  onChange={(e) => setForm({ ...form, numeroInterior: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Colonia</label>
                <input
                  type="text" placeholder="Ej: Del Valle"
                  value={form.colonia}
                  onChange={(e) => setForm({ ...form, colonia: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Ciudad *</label>
                <input
                  type="text" placeholder="Ej: Ciudad de México"
                  value={form.ciudad}
                  onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Estado *</label>
                <input
                  type="text" placeholder="Ej: CDMX"
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Código Postal *</label>
                <input
                  type="text" placeholder="Ej: 03100"
                  value={form.codigoPostal}
                  onChange={(e) => setForm({ ...form, codigoPostal: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Referencias</label>
                <input
                  type="text" placeholder="Ej: Casa azul con portón negro"
                  value={form.referencias}
                  onChange={(e) => setForm({ ...form, referencias: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox" id="esPrincipal"
                  checked={form.esPrincipal}
                  onChange={(e) => setForm({ ...form, esPrincipal: e.target.checked })}
                  className="w-4 h-4 accent-orange-500"
                />
                <label htmlFor="esPrincipal" className="text-sm text-gray-700 cursor-pointer">
                  Establecer como dirección principal
                </label>
              </div>
            </div>

            {saveError && (
              <p className="text-red-500 text-xs mt-3">{saveError}</p>
            )}

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-5 border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500 font-medium text-sm py-2.5 rounded-xl transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-500 text-sm">Cargando direcciones...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-6 py-4 rounded-2xl text-center">
            {error}
          </div>
        )}

        {!loading && !error && direcciones.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
              <MapPin size={28} className="text-orange-300" />
            </div>
            <p className="text-gray-700 font-bold mb-1">Sin direcciones guardadas</p>
            <p className="text-gray-500 text-sm">Agrega una para agilizar tus pedidos.</p>
          </div>
        )}

        {!loading && !error && direcciones.length > 0 && (
          <div className="space-y-4">
            {direcciones.map((d) => (
              <div
                key={d.DireccionId}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-extrabold text-gray-900">{d.Alias}</p>
                      {d.EsPrincipal && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-orange-50 text-orange-500 border border-orange-100 px-2 py-0.5 rounded-full">
                          <Star size={10} fill="currentColor" />
                          Principal
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm">
                      {[d.Calle, d.NumeroExterior, d.NumeroInterior].filter(Boolean).join(', ')}
                    </p>
                    {d.Colonia && (
                      <p className="text-gray-500 text-xs">{d.Colonia}</p>
                    )}
                    <p className="text-gray-500 text-xs">
                      {d.Ciudad}, {d.Estado} {d.CodigoPostal}
                    </p>
                    {d.Referencias && (
                      <p className="text-gray-400 text-xs mt-0.5 italic">{d.Referencias}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => abrirEditar(d)}
                      className="p-2 rounded-xl text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                      title="Editar"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleEliminar(d.DireccionId)}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
