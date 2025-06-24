
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from './auth/AuthProvider';
import Logo from './common/Logo';
import { toast } from 'sonner';

const Header = () => {
  const { user, signOut, forceLogout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log('Header: Starting logout process...');
      toast.success('Cerrando sesión...');
      await signOut();
      // El AuthProvider se encarga de la redirección
    } catch (error) {
      console.error('Header: Error during logout:', error);
      toast.error('Error al cerrar sesión, forzando logout...');
      // En caso de error, usar forceLogout como fallback
      forceLogout();
    }
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (user) {
      e.preventDefault();
      navigate('/dashboard');
      return false;
    }
  };

  // Debug: mostrar el estado actual en consola
  console.log('Header render - User:', user?.email || 'No user', 'Path:', window.location.pathname);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="miyo-container">
        <div className="flex items-center justify-between h-16">
          <Logo onClick={handleLogoClick} />
          
          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Hola, {user.email}
                  </span>
                </div>
                <Button 
                  onClick={handleLogout}
                  variant="outline" 
                  size="sm"
                  className="text-miyo-800 border-miyo-800 hover:bg-miyo-100"
                >
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/login?mode=signup">
                  <Button size="sm" className="bg-miyo-800 hover:bg-miyo-700">
                    Registro
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
