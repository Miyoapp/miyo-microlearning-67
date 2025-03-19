
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { User, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { 
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink
} from '@/components/ui/navigation-menu';
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';

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
      localStorage.removeItem("user");
      localStorage.removeItem("company");
      localStorage.removeItem("isAuthenticated");
      setIsAuthenticated(false);
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
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
        
        {!isAuthenticated ? (
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Personas
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/business" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Empresas
                  </NavigationMenuLink>
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
                  <span>Cerrar sesión</span>
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
