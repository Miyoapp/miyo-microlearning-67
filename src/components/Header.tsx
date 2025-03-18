
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Sesión cerrada con éxito');
      navigate('/landing');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
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
        
        <nav className="flex items-center space-x-8">
          <Link 
            to="/" 
            className={`hidden md:block font-medium transition-colors ${
              location.pathname === '/' 
                ? 'text-miyo-800 border-b-2 border-miyo-800' 
                : 'text-gray-600 hover:text-miyo-800'
            }`}
          >
            Inicio
          </Link>
          
          {user ? (
            <Button variant="outline" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          ) : (
            <Link to="/landing">
              <Button variant="outline">
                Iniciar sesión
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
