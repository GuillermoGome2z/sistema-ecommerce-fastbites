import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { forgotPassword, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim()) {
      setLocalError('Por favor ingresa tu correo electrónico.');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
      setTimeout(() => {
        navigate('/verificar-pin');
      }, 1500);
    } catch (err) {
      // El error se maneja en el contexto
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-orange-50/20 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-red-400/10 rounded-full blur-3xl" />

      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-gray-100 relative z-10">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <span className="text-white font-black text-lg">FB</span>
          </div>
          <h2 className="mt-4 text-3xl font-black text-gray-900 tracking-tight">
            Recuperar <span className="text-orange-500">Clave</span>
          </h2>
          <p className="mt-1.5 text-sm text-gray-500">
            Te enviaremos un código de seguridad de 6 dígitos para restablecer tu cuenta
          </p>
        </div>

        {/* Mensaje de Éxito */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-3 text-emerald-800 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />
            <div>
              Código de recuperación enviado. Redirigiendo a verificación...
            </div>
          </div>
        )}

        {/* Mensajes de error */}
        {(error || localError) && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-red-700 text-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-500" />
            <div>{localError || error}</div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all outline-none text-sm text-gray-900 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg shadow-orange-500/25 text-sm cursor-pointer"
          >
            {loading ? 'Enviando código...' : 'Solicitar código PIN'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="font-bold text-sm text-orange-500 hover:text-orange-600 transition-colors"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
