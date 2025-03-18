
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
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
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
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
          <Link 
            to="/features" 
            className={`font-medium transition-colors ${
              location.pathname === '/features' 
                ? 'text-miyo-800 border-b-2 border-miyo-800' 
                : 'text-gray-600 hover:text-miyo-800'
            }`}
          >
            Funcionalidades
          </Link>
          <Link 
            to="/pricing" 
            className={`font-medium transition-colors ${
              location.pathname === '/pricing' 
                ? 'text-miyo-800 border-b-2 border-miyo-800' 
                : 'text-gray-600 hover:text-miyo-800'
            }`}
          >
            Precios
          </Link>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="font-medium">
              Iniciar sesión
            </Button>
            <Button className="font-medium bg-miyo-800 text-white hover:bg-miyo-700">
              Registrarse
            </Button>
          </div>
        </nav>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden py-4 px-4 bg-white border-t">
          <nav className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className={`font-medium transition-colors py-2 ${
                location.pathname === '/' 
                  ? 'text-miyo-800' 
                  : 'text-gray-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link 
              to="/features" 
              className={`font-medium transition-colors py-2 ${
                location.pathname === '/features' 
                  ? 'text-miyo-800' 
                  : 'text-gray-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Funcionalidades
            </Link>
            <Link 
              to="/pricing" 
              className={`font-medium transition-colors py-2 ${
                location.pathname === '/pricing' 
                  ? 'text-miyo-800' 
                  : 'text-gray-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Precios
            </Link>
            <div className="flex flex-col space-y-3 pt-2">
              <Button variant="outline" className="w-full justify-center">
                Iniciar sesión
              </Button>
              <Button className="w-full justify-center bg-miyo-800 text-white hover:bg-miyo-700">
                Registrarse
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
