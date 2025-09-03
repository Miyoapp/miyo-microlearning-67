
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar/SidebarProvider';
import DashboardSidebar from './DashboardSidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50 overflow-hidden">
        <DashboardSidebar />
        <main className="flex-1 overflow-hidden pt-2 pr-2 pb-2 lg:pt-6 lg:pr-6 lg:pb-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
