
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  
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
  
  // Check for authenticated user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 bg-white ${
        scrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="miyo-container flex items-center justify-between">
        <Link to={user ? "/courses" : "/"} className="flex items-center">
          <span className="text-3xl font-bold tracking-tight text-miyo-800">MIYO</span>
        </Link>
        
        <nav className="hidden md:flex space-x-8">
          <Link 
            to="/courses" 
            className={`font-medium transition-colors ${
              location.pathname === '/courses' 
                ? 'text-miyo-800 border-b-2 border-miyo-800' 
                : 'text-gray-600 hover:text-miyo-800'
            }`}
          >
            Cursos
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <Button 
              variant="outline" 
              className="border-miyo-800 text-miyo-800 hover:bg-miyo-50"
              onClick={handleSignOut}
            >
              Cerrar sesión
            </Button>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" className="border-miyo-800 text-miyo-800 hover:bg-miyo-50">
                  Iniciar sesión
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-miyo-800 hover:bg-miyo-700">
                  Registrarse
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
