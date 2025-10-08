
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel,
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter 
} from '@/components/ui/sidebar/index';
import { useAuth } from '@/components/auth/AuthProvider';
import Logo from '@/components/common/Logo';
import { toast } from 'sonner';

const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, forceLogout } = useAuth();

  const explorationItems = [
    {
      title: 'Inicio',
      url: '/dashboard',
      icon: '🏠'
    },
    {
      title: 'Descubrir',
      url: '/dashboard/discover',
      icon: '🔍'
    },
    {
      title: 'Mis Rutas',
      url: '/dashboard/my-routes',
      icon: '📚'
    }
  ];

  const learningItems = [
    {
      title: 'Mis Notas',
      url: '/dashboard/mis-notas',
      icon: '📝'
    },
    {
      title: 'Mis Resúmenes',
      url: '/dashboard/mis-resumenes',
      icon: '📋'
    },
    {
      title: 'Mis Planes',
      url: '/dashboard/mis-planes',
      icon: '🎯'
    }
  ];

  const accountItems = [
    {
      title: 'Mi Perfil',
      url: '/dashboard/profile',
      icon: '👤'
    }
  ];

  const handleLogout = async () => {
    try {
      console.log('Sidebar: Starting logout process...');
      await signOut();
      console.log('Sidebar: Logout successful, navigating to home...');
      toast.success('Sesión cerrada exitosamente');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Sidebar: Error during logout:', error);
      // En caso de error, usar forceLogout como fallback
      forceLogout();
      toast.success('Sesión cerrada exitosamente');
      navigate('/', { replace: true });
    }
  };

  const renderMenuItems = (items: typeof explorationItems) => (
    <SidebarMenu className="space-y-2">
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton 
            asChild 
            className={`w-full justify-start px-4 py-3 rounded-lg transition-colors bg-white hover:bg-gray-100 ${
              location.pathname === item.url 
                ? 'bg-miyo-100 text-miyo-800' 
                : 'text-gray-700'
            }`}
          >
            <Link to={item.url} className="flex items-center space-x-3">
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader className="p-6 bg-white">
        <Logo />
      </SidebarHeader>
      
      <SidebarContent className="bg-white">
        {/* Exploración Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-4">
            EXPLORACIÓN
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(explorationItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Mi Aprendizaje Group */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-4">
            MI APRENDIZAJE
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(learningItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Mi Cuenta Group */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-4">
            MI CUENTA
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(accountItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 bg-white">
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 bg-white"
        >
          🚪 Cerrar sesión
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
