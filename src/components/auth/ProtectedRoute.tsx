
import React, { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Solo redirigir si definitivamente no hay autenticación y no está cargando
    if (!loading && !user && !session) {
      console.log('ProtectedRoute: No authenticated user, redirecting to home...');
      navigate('/', { replace: true });
    }
  }, [loading, user, session, navigate]);

  // Si hay sesión válida, renderizar inmediatamente
  if (session && user) {
    return <>{children}</>;
  }

  // Mostrar loading mínimo solo si realmente está cargando
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-miyo-800 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Verificando autenticación...</div>
        </div>
      </div>
    );
  }

  // Si no hay usuario autenticado, no renderizar nada (la redirección ya se activó)
  return null;
};

export default ProtectedRoute;
