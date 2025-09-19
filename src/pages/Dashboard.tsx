

import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardWelcomeHeader from '@/components/dashboard/DashboardWelcomeHeader';
import DashboardCourseSection from '@/components/dashboard/DashboardCourseSection';
import { SidebarTrigger } from '@/components/ui/sidebar/SidebarTrigger';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { 
  getContinueLearningCourses, 
  getFreeCourses, 
  getPremiumCourses 
} from '@/utils/dashboardUtils';

const Dashboard = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const {
    allCourses,
    loading,
    userName,
    isFirstTimeUser,
    userProgress,
    toggleSaveCourse,
    refetch,
  } = useDashboardData();

  // Get courses in progress
  const continueLearningCourses = getContinueLearningCourses(allCourses, userProgress);

  // Get free courses for "Comienza Aquí" section
  const freeCourses = getFreeCourses(allCourses, userProgress);

  // Get premium courses
  const premiumCourses = getPremiumCourses(allCourses, userProgress);

  // CORREGIDO: Solo navegar al curso, no iniciar reproducción
  const handlePlayCourse = async (courseId: string) => {
    console.log('Dashboard: Navigating to course (maintaining current progress):', courseId);
    navigate(`/dashboard/course/${courseId}`);
  };

  const handleToggleSave = async (courseId: string) => {
    console.log('Dashboard: Toggling save for course:', courseId);
    await toggleSaveCourse(courseId);
    await refetch();
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/dashboard/course/${courseId}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-lg text-gray-600">Cargando cursos...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Mobile hamburger menu - CORREGIDO: z-index más alto y posición fija */}
      {isMobile && (
        <div className="fixed top-4 right-4 z-50 bg-white rounded-full shadow-lg">
          <SidebarTrigger />
        </div>
      )}
      
      <div className="h-full overflow-y-auto px-4 sm:px-6">
        <div className="max-w-7xl mx-auto pb-6">
          <DashboardWelcomeHeader 
            userName={userName}
            isFirstTimeUser={isFirstTimeUser}
          />

          {/* Mobile-first course sections */}
          <div className="space-y-8 sm:space-y-12">
            <DashboardCourseSection
              title="🎧 Continúa escuchando"
              courses={continueLearningCourses}
              showProgress={true}
              onPlayCourse={handlePlayCourse}
              onToggleSave={handleToggleSave}
              onCourseClick={handleCourseClick}
            />

            <DashboardCourseSection
              title="⭐ Comienza Aquí"
              subtitle="Cursos perfectos para dar tus primeros pasos"
              courses={freeCourses}
              showProgress={false}
              onPlayCourse={handlePlayCourse}
              onToggleSave={handleToggleSave}
              onCourseClick={handleCourseClick}
            />

            <DashboardCourseSection
              title="👑 Cursos Premium"
              courses={premiumCourses}
              showProgress={false}
              onPlayCourse={handlePlayCourse}
              onToggleSave={handleToggleSave}
              onCourseClick={handleCourseClick}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

