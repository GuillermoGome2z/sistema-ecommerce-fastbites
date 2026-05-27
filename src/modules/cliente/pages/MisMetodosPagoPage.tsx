import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Banknote, Plus, Trash2, Star } from 'lucide-react';
import { API_BASE_URL } from '../../../config/api';

// ── Shapes ───────────────────────────────────────────────────────
interface MetodoPago {
  MetodoPagoId:    number;
  TipoPagoId:      number;
  NombreTipo:      string;
  Alias:           string | null;
  Ultimos4Digitos: string | null;
  MarcaTarjeta:    string | null;
  EsPrincipal:     boolean;
}

interface TipoPago {
  TipoPagoId:  number;
  Nombre:      string;
  Descripcion: string | null;
}

interface FormState {
  tipoPagoId:      string;
  alias:           string;
  ultimos4Digitos: string;
  marcaTarjeta:    string;
  esPrincipal:     boolean;
}

const FORM_EMPTY: FormState = {
  tipoPagoId: '', alias: '', ultimos4Digitos: '', marcaTarjeta: '', esPrincipal: false,
};

function getHeaders() {
  return {
    Authorization:  `Bearer ${localStorage.getItem('fb_token') ?? ''}`,
    'Content-Type': 'application/json',
  };
}

function esTarjeta(nombre: string) {
  return nombre.toLowerCase().includes('tarjeta');
}

export default function MisMetodosPagoPage() {
  const [metodos, setMetodos]     = useState<MetodoPago[]>([]);
  const [tiposPago, setTiposPago] = useState<TipoPago[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState<FormState>(FORM_EMPTY);
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState('');

  function cargar() {
    setLoading(true);
    const headers = { Authorization: `Bearer ${localStorage.getItem('fb_token') ?? ''}` };

    Promise.all([
      fetch(`${API_BASE_URL}/api/customers/me/payment-methods`, { headers }).then((r) => r.json()),
      fetch(`${API_BASE_URL}/api/payment-types`).then((r) => r.json()),
    ])
      .then(([metodosJson, tiposJson]) => {
        if (metodosJson.success) setMetodos(metodosJson.data as MetodoPago[]);
        else setError(metodosJson.message ?? 'Error al cargar métodos de pago.');
        if (tiposJson.success) setTiposPago(tiposJson.data as TipoPago[]);
      })
      .catch(() => setError('No se pudo conectar con el servidor.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { cargar(); }, []);

  function abrirAgregar() {
    setForm(FORM_EMPTY);
    setSaveError('');
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.tipoPagoId) {
      setSaveError('Selecciona un tipo de pago.');
      return;
    }
    if (form.ultimos4Digitos && !/^\d{4}$/.test(form.ultimos4Digitos)) {
      setSaveError('Los últimos 4 dígitos deben ser exactamente 4 números.');
      return;
    }
    setSaving(true);
    setSaveError('');

    const body: Record<string, unknown> = {
      tipoPagoId:  Number(form.tipoPagoId),
      esPrincipal: form.esPrincipal,
    };
    if (form.alias.trim())           body.alias           = form.alias.trim();
    if (form.ultimos4Digitos.trim()) body.ultimos4Digitos = form.ultimos4Digitos.trim();
    if (form.marcaTarjeta.trim())    body.marcaTarjeta    = form.marcaTarjeta.trim();

    try {
      const r    = await fetch(`${API_BASE_URL}/api/customers/me/payment-methods`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify(body),
      });
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
    if (!window.confirm('¿Eliminar este método de pago?')) return;
    try {
      const r    = await fetch(`${API_BASE_URL}/api/customers/me/payment-methods/${id}`, {
        method: 'DELETE', headers: getHeaders(),
      });
      const json = await r.json();
      if (json.success) cargar();
      else setError(json.message ?? 'Error al eliminar.');
    } catch {
      setError('Error de conexión.');
    }
  }

  const tipoSeleccionado = tiposPago.find((t) => String(t.TipoPagoId) === form.tipoPagoId);
  const mostrarCamposTarjeta = tipoSeleccionado ? esTarjeta(tipoSeleccionado.Nombre) : false;

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
            <CreditCard size={28} className="text-orange-500" />
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Métodos de Pago</h1>
              {!loading && !error && (
                <p className="text-gray-500 text-sm mt-0.5">{metodos.length} método{metodos.length !== 1 ? 's' : ''} guardado{metodos.length !== 1 ? 's' : ''}</p>
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
            <h3 className="font-extrabold text-gray-900 mb-4">Nuevo método de pago</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Tipo de pago *</label>
                <select
                  value={form.tipoPagoId}
                  onChange={(e) => setForm({ ...form, tipoPagoId: e.target.value, ultimos4Digitos: '', marcaTarjeta: '' })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white"
                >
                  <option value="">Selecciona un tipo...</option>
                  {tiposPago.map((t) => (
                    <option key={t.TipoPagoId} value={String(t.TipoPagoId)}>
                      {t.Nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Alias (opcional)</label>
                <input
                  type="text" placeholder="Ej: Mi Visa principal"
                  value={form.alias}
                  onChange={(e) => setForm({ ...form, alias: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>

              {mostrarCamposTarjeta && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Últimos 4 dígitos</label>
                      <input
                        type="text" placeholder="4242" maxLength={4}
                        value={form.ultimos4Digitos}
                        onChange={(e) => setForm({ ...form, ultimos4Digitos: e.target.value.replace(/\D/g, '') })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Marca</label>
                      <input
                        type="text" placeholder="Visa, Mastercard..."
                        value={form.marcaTarjeta}
                        onChange={(e) => setForm({ ...form, marcaTarjeta: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                    Solo ingresa los últimos 4 dígitos. Nunca guardamos el número completo.
                  </p>
                </>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox" id="esPrincipalPago"
                  checked={form.esPrincipal}
                  onChange={(e) => setForm({ ...form, esPrincipal: e.target.checked })}
                  className="w-4 h-4 accent-orange-500"
                />
                <label htmlFor="esPrincipalPago" className="text-sm text-gray-700 cursor-pointer">
                  Establecer como método principal
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
            <p className="text-gray-500 text-sm">Cargando métodos de pago...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-6 py-4 rounded-2xl text-center">
            {error}
          </div>
        )}

        {!loading && !error && metodos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
              <CreditCard size={28} className="text-orange-300" />
            </div>
            <p className="text-gray-700 font-bold mb-1">Sin métodos de pago</p>
            <p className="text-gray-500 text-sm">Agrega uno para agilizar el checkout.</p>
          </div>
        )}

        {!loading && !error && metodos.length > 0 && (
          <div className="space-y-4">
            {metodos.map((m) => (
              <div
                key={m.MetodoPagoId}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  {esTarjeta(m.NombreTipo)
                    ? <CreditCard size={22} className="text-orange-500" />
                    : <Banknote size={22} className="text-orange-500" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-gray-900 text-sm">
                      {m.Alias ?? m.NombreTipo}
                    </p>
                    {m.EsPrincipal && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-orange-50 text-orange-500 border border-orange-100 px-2 py-0.5 rounded-full">
                        <Star size={10} fill="currentColor" />
                        Principal
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs">
                    {m.NombreTipo}
                    {m.MarcaTarjeta && ` · ${m.MarcaTarjeta}`}
                    {m.Ultimos4Digitos && ` · •••• ${m.Ultimos4Digitos}`}
                  </p>
                </div>

                <button
                  onClick={() => handleEliminar(m.MetodoPagoId)}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                  title="Eliminar"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
