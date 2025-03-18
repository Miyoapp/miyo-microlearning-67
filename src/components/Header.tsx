
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
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
            className="font-medium transition-colors text-gray-600 hover:text-miyo-800"
          >
            Características
          </Link>
          <Link 
            to="/" 
            className="font-medium transition-colors text-gray-600 hover:text-miyo-800"
          >
            Podcasts
          </Link>
          <Link 
            to="/" 
            className="font-medium transition-colors text-gray-600 hover:text-miyo-800"
          >
            Recursos
          </Link>
          <Link 
            to="/" 
            className="font-medium transition-colors text-gray-600 hover:text-miyo-800"
          >
            Precios
          </Link>
          <div className="flex items-center gap-3 ml-4">
            <Button variant="outline" className="font-medium">
              Iniciar sesión
            </Button>
            <Button className="bg-miyo-700 hover:bg-miyo-800 text-white font-medium">
              Registrarse
            </Button>
          </div>
        </nav>
        
        {/* Mobile menu button - to be implemented */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
