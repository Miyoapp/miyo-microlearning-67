
import React from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { SidebarTrigger } from '@/components/ui/sidebar/index';
import { useIsMobile } from '@/hooks/use-mobile';
import CourseNotesSection from '@/components/course-notes/CourseNotesSection';

const DashboardCourseNotes = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const isMobile = useIsMobile();

  if (!courseId) {
    return <div>Error: ID del curso no encontrado</div>;
  }

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
          <CourseNotesSection courseId={courseId} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardCourseNotes;
