import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardWelcomeHeader from '@/components/dashboard/DashboardWelcomeHeader';
import DashboardCourseSection from '@/components/dashboard/DashboardCourseSection';
import { SidebarTrigger } from '@/components/ui/sidebar/SidebarTrigger';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDashboardDataOptimized } from '@/hooks/dashboard/useDashboardDataOptimized';

/**
 * OPTIMIZED: Dashboard que usa React Query para caché inteligente
 * Reduce las consultas de 36+ a solo 2-3 optimizadas
 */
const DashboardOptimized = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const {
    continueLearningCourses,
    freeCourses,
    premiumCourses,
    loading,
    error,
    userName,
    isFirstTimeUser,
    toggleSaveCourse,
    refetch,
  } = useDashboardDataOptimized();

  // CORREGIDO: Solo navegar al curso, no iniciar reproducción
  const handlePlayCourse = async (courseId: string) => {
    console.log('🚀 OPTIMIZED Dashboard: Navigating to course:', courseId);
    navigate(`/dashboard/course/${courseId}`);
  };

  const handleToggleSave = async (courseId: string) => {
    console.log('🚀 OPTIMIZED Dashboard: Toggling save for course:', courseId);
    await toggleSaveCourse(courseId);
    // Note: refetch not needed due to optimistic updates in cache
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

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-lg text-red-600">Error al cargar los cursos. Intenta recargar la página.</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Mobile hamburger menu */}
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

export default DashboardOptimized;