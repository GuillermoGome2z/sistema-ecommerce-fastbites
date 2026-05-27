import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../modules/auth/context/AuthContext';

export default function AdminLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Protección de acceso administrativo (Admin Guard)
  const isAuthorized = user && user.roles.some(r => ['Administrador', 'Supervisor', 'EmpleadoBackoffice'].includes(r));

  if (!isAuthorized) {
    console.warn('[SECURITY] Acceso denegado al panel de administración. Redirigiendo a login.');
    return <Navigate to="/login" replace />;
  }

  // Las páginas del backoffice ya se envuelven a sí mismas en su propio AdminLayout interno.
  // Por lo tanto, aquí actuamos puramente como Shield de seguridad y renderizamos el Outlet directamente
  // para evitar la duplicidad del sidebar y del cabezal en pantalla.
  return <Outlet />;
}
