import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../modules/auth/context/AuthContext';

interface Props {
  allowedRoles: string[];
}

export default function RequireRole({ allowedRoles }: Props) {
  const { user } = useAuth();
  const hasRole = user?.roles.some(r => allowedRoles.includes(r)) ?? false;
  if (!hasRole) return <Navigate to="/admin" replace />;
  return <Outlet />;
}
