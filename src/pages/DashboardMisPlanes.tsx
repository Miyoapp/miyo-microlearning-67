
import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { SidebarTrigger } from '@/components/ui/sidebar/index';
import { useIsMobile } from '@/hooks/use-mobile';
import ActionPlansList from '@/components/action-plans/ActionPlansList/ActionPlansList';

const DashboardMisPlanes = () => {
  const isMobile = useIsMobile();

  return (
    <DashboardLayout>
      {/* Mobile hamburger menu */}
      {isMobile && (
        <div className="fixed top-4 right-4 z-50 bg-white rounded-full shadow-lg">
          <SidebarTrigger />
        </div>
      )}
      
      <div className="h-full overflow-y-auto pl-6">
        <div className="max-w-7xl mx-auto pb-6">
          <ActionPlansList />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardMisPlanes;
