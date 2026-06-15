import { Navigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, rol } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && rol && !allowedRoles.includes(rol)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};