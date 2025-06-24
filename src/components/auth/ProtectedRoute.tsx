
import React, { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useNavigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Si no está cargando y no hay usuario autenticado, redirigir
    if (!loading && !user && !session) {
      console.log('ProtectedRoute: No authenticated user, redirecting to home...');
      navigate('/', { replace: true });
    }
  }, [loading, user, session, navigate]);

  // Mostrar loading mientras se verifica la autenticación
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
  if (!user || !session) {
    return null;
  }

  // Si hay usuario autenticado, renderizar el contenido protegido
  return <>{children}</>;
};

export default ProtectedRoute;
