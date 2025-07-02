
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from './auth/AuthProvider';
import Logo from './common/Logo';
import { toast } from 'sonner';
import { SidebarTrigger } from '@/components/ui/sidebar/SidebarTrigger';
import { useIsMobile } from '@/hooks/use-mobile';

const Header = () => {
  const { user, signOut, forceLogout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    try {
      console.log('Header: Starting logout process...');
      await signOut();
      console.log('Header: Logout successful, navigating to home...');
      toast.success('Sesión cerrada exitosamente');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Header: Error during logout:', error);
      // En caso de error, usar forceLogout como fallback
      forceLogout();
      toast.success('Sesión cerrada exitosamente');
      navigate('/', { replace: true });
    }
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (user) {
      e.preventDefault();
      navigate('/dashboard');
      return false;
    }
  };

  // Only show sidebar trigger in dashboard routes
  const isDashboardRoute = window.location.pathname.startsWith('/dashboard');

  // Debug: mostrar el estado actual en consola
  console.log('Header render - User:', user?.email || 'No user', 'Path:', window.location.pathname);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="miyo-container">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Layout: Logo left, auth buttons right (no hamburger here for logged in users) */}
          {isMobile ? (
            <>
              <Logo onClick={handleLogoClick} />
              
              <nav className="flex items-center space-x-2">
                 {user ? (
                  <>
                    {isDashboardRoute && <SidebarTrigger />}
                    <Button 
                      onClick={handleLogout}
                      variant="outline" 
                      size="sm"
                      className="text-miyo-800 border-miyo-800 hover:bg-miyo-100 text-xs px-2"
                    >
                      Cerrar
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="ghost" size="sm" className="text-xs">
                        Entrar
                      </Button>
                    </Link>
                    <Link to="/login?mode=signup">
                      <Button size="sm" className="bg-miyo-800 hover:bg-miyo-700 text-xs">
                        Registro
                      </Button>
                    </Link>
                  </>
                )}
              </nav>
            </>
          ) : (
            /* Desktop Layout: Current layout maintained */
            <>
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
                     {isDashboardRoute && <SidebarTrigger />}
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
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
