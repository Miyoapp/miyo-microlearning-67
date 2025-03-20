
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { 
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import Logo from './common/Logo';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userName = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "{}").name || "Usuario" : "Usuario";
  
  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem("isAuthenticated") === "true";
      setIsAuthenticated(authStatus);
    };
    
    checkAuth();
    // Listen for auth state changes
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);
  
  // Add scroll event listener to add shadow when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("user");
      localStorage.removeItem("company");
      localStorage.removeItem("isAuthenticated");
      setIsAuthenticated(false);
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };
  
  const handleLogoClick = (e) => {
    // If user is authenticated and on the company dashboard, prevent default navigation
    if (isAuthenticated && location.pathname.includes('/company')) {
      e.preventDefault();
    }
  };

  // Function to check if a route is active
  const isRouteActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path === '/personas' && location.pathname === '/personas') return true;
    if (path === '/business' && location.pathname === '/business') return true;
    return false;
  };
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 bg-white ${
        scrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="miyo-container flex items-center justify-between">
        <Logo linkClassName="flex items-center" onClick={handleLogoClick} />
        
        {!isAuthenticated ? (
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link 
                  to="/" 
                  className={cn(
                    "px-4 py-2 relative text-sm font-medium transition-colors",
                    isRouteActive('/') ? 'text-miyo-800' : 'text-gray-600 hover:text-miyo-600'
                  )}
                >
                  <span className="relative">
                    Inicio
                    {isRouteActive('/') && (
                      <span className="absolute left-0 -bottom-1 w-full h-[3px] bg-miyo-800"></span>
                    )}
                  </span>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link 
                  to="/personas" 
                  className={cn(
                    "px-4 py-2 relative text-sm font-medium transition-colors",
                    isRouteActive('/personas') ? 'text-miyo-800' : 'text-gray-600 hover:text-miyo-600'
                  )}
                >
                  <span className="relative">
                    Personas
                    {isRouteActive('/personas') && (
                      <span className="absolute left-0 -bottom-1 w-full h-[3px] bg-miyo-800"></span>
                    )}
                  </span>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link 
                  to="/business" 
                  className={cn(
                    "px-4 py-2 relative text-sm font-medium transition-colors",
                    isRouteActive('/business') ? 'text-miyo-800' : 'text-gray-600 hover:text-miyo-600'
                  )}
                >
                  <span className="relative">
                    Empresas
                    {isRouteActive('/business') && (
                      <span className="absolute left-0 -bottom-1 w-full h-[3px] bg-miyo-800"></span>
                    )}
                  </span>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        ) : (
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center focus:outline-none">
                <Avatar className="h-9 w-9 bg-miyo-100">
                  <AvatarFallback className="text-miyo-800">
                    {userName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 z-50 bg-white">
                <div className="p-2 border-b">
                  <p className="text-sm font-medium">{userName}</p>
                </div>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Salir</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
