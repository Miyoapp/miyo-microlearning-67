
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
import { LogOut, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from './common/Logo';
import { useAuth } from './auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name?: string } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  // Add scroll event listener to add shadow when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch user profile when user changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();
        
        setUserProfile(data);
      } else {
        setUserProfile(null);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/"); // Redirect to public landing page
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/login?mode=signup');
  };

  // Show welcome message on dashboard pages
  const isDashboard = location.pathname.startsWith('/dashboard');
  const userName = userProfile?.name || user?.email?.split('@')[0] || 'Usuario';
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 py-3 sm:py-4 transition-all duration-300 bg-white ${
        scrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="miyo-container flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Logo linkClassName="flex items-center" />
          {user && isDashboard && (
            <span className="hidden sm:block text-sm sm:text-base text-gray-700 font-medium truncate">
              ¡Bienvenido de vuelta, {userName}!
            </span>
          )}
        </div>
        
        {!user ? (
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={handleLogin}
              className="text-gray-600 hover:text-miyo-600 font-medium transition-colors text-sm sm:text-base"
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={handleRegister}
              className="bg-miyo-800 hover:bg-miyo-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Registro
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2 sm:space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center focus:outline-none">
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 bg-miyo-100">
                  <AvatarFallback className="text-miyo-800 text-xs sm:text-sm">
                    {userName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 sm:w-56 z-50 bg-white">
                <div className="p-2 border-b">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                  {userProfile?.name && (
                    <p className="text-xs text-gray-500 truncate">{userProfile.name}</p>
                  )}
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
