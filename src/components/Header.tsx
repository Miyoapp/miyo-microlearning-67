
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from './auth/AuthProvider';
import Logo from './common/Logo';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (user) {
      e.preventDefault();
      navigate('/dashboard');
      return false;
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="miyo-container">
        <div className="flex items-center justify-between h-16">
          <Logo onClick={handleLogoClick} />
          
          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">
                  Hola, {user.email}
                </span>
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
                <Link to="/login">
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
