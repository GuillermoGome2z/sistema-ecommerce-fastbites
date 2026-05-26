import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ShieldAlert, KeyRound, Lock, ArrowRight } from 'lucide-react';

export default function VerifyPinPage() {
  const { user, tempVerification, verifyPin, resetPassword, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Redirigir si no hay verificación en curso o si ya inició sesión
  useEffect(() => {
    if (user) {
      navigate('/');
    } else if (!tempVerification) {
      navigate('/login');
    }
  }, [tempVerification, user, navigate]);

  const [pin, setPin] = useState<string[]>(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Focus en el primer input al montar
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  if (!tempVerification) return null;

  const { email, type } = tempVerification;

  const handlePinChange = (value: string, index: number) => {
    // Solo permitir números
    if (value && !/^\d+$/.test(value)) return;

    const newPin = [...pin];
    // Tomar solo el último caracter si pegan contenido
    newPin[index] = value.slice(-1);
    setPin(newPin);

    // Auto-focus al siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Retroceder al borrar con Backspace
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const newPin = [...pin];
      newPin[index - 1] = '';
      setPin(newPin);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    if (!/^\d{6}$/.test(pastedData)) return;

    const digits = pastedData.split('');
    setPin(digits);
    inputRefs.current[5]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    const pinStr = pin.join('');
    if (pinStr.length < 6) {
      setLocalError('Por favor ingresa el código PIN de 6 dígitos.');
      return;
    }

    setLoading(true);
    try {
      if (type === 'recovery') {
        // En flujo de recuperación validamos clave nueva
        if (!newPassword || !confirmPassword) {
          setLocalError('Por favor ingresa tu nueva contraseña.');
          setLoading(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setLocalError('Las contraseñas no coinciden.');
          setLoading(false);
          return;
        }
        if (newPassword.length < 6) {
          setLocalError('La contraseña debe tener al menos 6 caracteres.');
          setLoading(false);
          return;
        }

        await resetPassword(pinStr, newPassword);
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Registro o Login MFA estándar
        await verifyPin(pinStr);
        navigate('/');
      }
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
            {type === 'recovery' ? (
              <KeyRound className="text-white w-6 h-6 animate-pulse" />
            ) : (
              <ShieldCheck className="text-white w-6 h-6" />
            )}
          </div>
          <h2 className="mt-4 text-3xl font-black text-gray-900 tracking-tight">
            {type === 'mfa' && 'Verificación Doble'}
            {type === 'registration' && 'Verifica tu Cuenta'}
            {type === 'recovery' && 'Nueva Contraseña'}
          </h2>
          <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
            {type === 'mfa' && `Hemos enviado un código PIN a ${email} para autorizar tu inicio de sesión.`}
            {type === 'registration' && `Te enviamos un código de activación al correo ${email}.`}
            {type === 'recovery' && `Ingresa el código PIN impreso en la consola y tu nueva contraseña.`}
          </p>
        </div>

        {/* Mensaje de Éxito en recuperación */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex gap-3 text-sm">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-500" />
            <div>¡Contraseña restablecida con éxito! Redirigiendo al login...</div>
          </div>
        )}

        {/* Mensajes de error */}
        {(error || localError) && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-red-700 text-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-500" />
            <div>{localError || error}</div>
          </div>
        )}

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          {/* Segmentos de PIN de 6 dígitos */}
          <div>
            <label className="block text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Ingresa el código de 6 dígitos
            </label>
            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {pin.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={digit}
                  ref={(el) => { inputRefs.current[idx] = el as HTMLInputElement; }}
                  onChange={(e) => handlePinChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className="w-12 h-14 text-center text-xl font-bold bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all outline-none"
                />
              ))}
            </div>
          </div>

          {/* Formulario de nueva clave sólo si es flujo de recuperación */}
          {type === 'recovery' && (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all outline-none text-sm text-gray-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma la contraseña"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all outline-none text-sm text-gray-900 font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-lg shadow-orange-500/25 text-sm cursor-pointer"
          >
            {loading ? 'Verificando...' : 'Confirmar'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/login')}
            className="text-xs font-bold text-gray-400 hover:text-orange-500 transition-colors"
          >
            Cancelar y volver
          </button>
        </div>
      </div>
    </div>
  );
}
