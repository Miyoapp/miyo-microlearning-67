
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter 
} from '@/components/ui/sidebar';
import { useAuth } from '@/components/auth/AuthProvider';
import Logo from '@/components/common/Logo';

const DashboardSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  const menuItems = [
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

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="p-6">
        <Logo />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`w-full justify-start px-4 py-3 rounded-lg transition-colors ${
                      location.pathname === item.url 
                        ? 'bg-miyo-100 text-miyo-800' 
                        : 'hover:bg-gray-100'
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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <Button 
          variant="outline" 
          onClick={signOut}
          className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
        >
          🚪 Cerrar sesión
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
