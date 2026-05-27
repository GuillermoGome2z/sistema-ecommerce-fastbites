import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { API_BASE_URL } from '../../../config/api';

export interface User {
  id: number;
  email: string;
  nombreCompleto: string;
  roles: string[];
}

interface VerificationState {
  userId: number;
  email: string;
  type: 'registration' | 'mfa' | 'recovery';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  tempVerification: VerificationState | null;
  login: (email: string, password: string) => Promise<{ requireMfa?: boolean; requireVerification?: boolean }>;
  register: (email: string, password: string, nombreCompleto: string, telefono: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (pin: string, newPassword: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setTempVerification: (state: VerificationState | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tempVerification, setTempVerification] = useState<VerificationState | null>(null);

  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem('fb_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (json.success) {
          setUser(json.data);
        } else {
          localStorage.removeItem('fb_token');
        }
      } catch (err) {
        console.error('Error al inicializar sesión:', err);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();

      if (!json.success) {
        if (json.require_verification) {
          setTempVerification({ userId: json.userId, email: json.email, type: 'registration' });
          return { requireVerification: true };
        }
        throw new Error(json.message || 'Credenciales incorrectas');
      }

      if (json.require_mfa) {
        setTempVerification({ userId: json.userId, email: json.email, type: 'mfa' });
        return { requireMfa: true };
      }

      return {};
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, nombreCompleto: string, telefono: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nombreCompleto, telefono }),
      });
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || 'Error en el registro');
      }

      if (json.require_verification) {
        setTempVerification({ userId: json.userId, email: json.email, type: 'registration' });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error en el registro';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const verifyPin = async (pin: string) => {
    if (!tempVerification) throw new Error('No hay verificación en curso');
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: tempVerification.userId,
          pin,
          type: tempVerification.type,
        }),
      });
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || 'Código PIN inválido');
      }

      if (tempVerification.type === 'registration' || tempVerification.type === 'mfa') {
        const { token, usuario } = json.data;
        localStorage.setItem('fb_token', token);
        setUser(usuario);
        setTempVerification(null);
      } else if (tempVerification.type === 'recovery') {
        // En recuperación solo marcamos como verificado temporalmente en sesión para cambiar la clave
        return;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error de verificación';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || 'Error al solicitar PIN');
      }

      if (json.userId) {
        setTempVerification({ userId: json.userId, email: json.email, type: 'recovery' });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error de recuperación';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (pin: string, newPassword: string) => {
    if (!tempVerification) throw new Error('No hay verificación de recuperación activa');
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: tempVerification.userId,
          pin,
          newPassword,
        }),
      });
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || 'Error al restablecer contraseña');
      }

      setTempVerification(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al restablecer contraseña';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('fb_token');
    setUser(null);
    setTempVerification(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        tempVerification,
        login,
        register,
        verifyPin,
        forgotPassword,
        resetPassword,
        logout,
        clearError,
        setTempVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
