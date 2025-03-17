
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

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
        
        <nav className="hidden md:flex space-x-8">
          <Link 
            to="/" 
            className={`font-medium transition-colors ${
              location.pathname === '/' 
                ? 'text-miyo-800 border-b-2 border-miyo-800' 
                : 'text-gray-600 hover:text-miyo-800'
            }`}
          >
            Home
          </Link>
          <a 
            href="#" 
            className="font-medium text-gray-600 hover:text-miyo-800 transition-colors"
          >
            Explore
          </a>
          <a 
            href="#" 
            className="font-medium text-gray-600 hover:text-miyo-800 transition-colors"
          >
            About
          </a>
        </nav>
        
        <div className="flex items-center space-x-4">
          <button className="hidden md:block px-4 py-2 text-miyo-800 border border-miyo-800 rounded-full hover:bg-miyo-50 transition-colors">
            Sign In
          </button>
          <button className="px-4 py-2 bg-miyo-800 text-white rounded-full hover:bg-miyo-700 transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
