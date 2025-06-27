
import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import DashboardSidebar from './DashboardSidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <DashboardSidebar />
        <main className="flex-1 p-6">
          {/* Mobile: Menu button on the right */}
          {isMobile && (
            <div className="flex justify-end mb-4">
              <SidebarTrigger />
            </div>
          )}
          
          {/* Desktop: Menu button on the left (existing behavior) */}
          {!isMobile && (
            <div className="md:hidden mb-4">
              <SidebarTrigger />
            </div>
          )}
          
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
