
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Add scroll event listener to add shadow when scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Check auth status
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      setIsLoading(false);
    };
    
    checkSession();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente"
      });
      navigate('/landing');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cerrar la sesión"
      });
    }
  };
  
  const redirectToLanding = () => {
    navigate('/landing');
  };
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 bg-white ${
        scrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="miyo-container flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <span className="text-3xl font-bold tracking-tight text-miyo-800">MIYO</span>
        </Link>
        
        <nav className="hidden md:flex space-x-8 items-center">
          <Link 
            to="/" 
            className={`font-medium transition-colors ${
              location.pathname === '/' 
                ? 'text-miyo-800 border-b-2 border-miyo-800' 
                : 'text-gray-600 hover:text-miyo-800'
            }`}
          >
            Inicio
          </Link>
          
          {isLoading ? (
            <div className="h-9 w-20 bg-gray-200 animate-pulse rounded-md"></div>
          ) : isAuthenticated ? (
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          ) : (
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => redirectToLanding()}
              >
                <LogIn className="h-4 w-4" />
                Iniciar sesión
              </Button>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => redirectToLanding()}
              >
                <UserPlus className="h-4 w-4" />
                Registrarse
              </Button>
            </div>
          )}
        </nav>
        
        {/* Mobile auth buttons */}
        <div className="md:hidden">
          {!isLoading && !isAuthenticated && (
            <Button
              size="sm"
              onClick={() => redirectToLanding()}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Entrar
            </Button>
          )}
          
          {!isLoading && isAuthenticated && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
