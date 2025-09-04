import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import TouchCarousel from '@/components/dashboard/TouchCarousel';
import CourseCardWithProgress from '@/components/dashboard/CourseCardWithProgress';
import { useCachedCoursesFiltered } from '@/hooks/queries/useCachedCourses';
import { useCachedProgressData, useToggleSaveCourse } from '@/hooks/queries/useCachedUserProgress';
import { SidebarTrigger } from '@/components/ui/sidebar/index';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * OPTIMIZED: My Routes page que usa React Query para caché inteligente
 * Reutiliza datos cacheados y elimina consultas redundantes
 */
const DashboardMyRoutesOptimized = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // OPTIMIZED: Use cached courses data
  const { 
    allCourses, 
    isLoading: coursesLoading, 
    error: coursesError 
  } = useCachedCoursesFiltered();
  
  // OPTIMIZED: Use cached user progress with derived data functions
  const { 
    userProgress,
    getContinueLearningCourses,
    getSavedCourses,
    getCompletedCourses,
    isLoading: progressLoading 
  } = useCachedProgressData();
  
  // OPTIMIZED: Use cached toggle save mutation
  const toggleSaveCourseMutation = useToggleSaveCourse();

  const loading = coursesLoading || progressLoading;

  // OPTIMIZED: Calculate derived data using cached functions
  const continueLearningCourses = getContinueLearningCourses(allCourses);
  const savedCourses = getSavedCourses(allCourses);
  const completedCourses = getCompletedCourses(allCourses);

  // CORREGIDO: Solo navegar al curso, no iniciar reproducción
  const handlePlayCourse = async (courseId: string) => {
    console.log('🚀 OPTIMIZED MyRoutes: Navigating to course:', courseId);
    navigate(`/dashboard/course/${courseId}`);
  };

  const handleToggleSave = async (courseId: string) => {
    console.log('🚀 OPTIMIZED MyRoutes: Toggling save for course:', courseId);
    await toggleSaveCourseMutation.mutateAsync(courseId);
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/dashboard/course/${courseId}`);
  };

  console.log('🚀 OPTIMIZED MyRoutes render:', {
    savedCoursesCount: savedCourses.length,
    continueLearningCount: continueLearningCourses.length,
    completedCoursesCount: completedCourses.length,
    loading
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-lg text-gray-600">Cargando cursos...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (coursesError) {
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

      <div className="h-full overflow-y-auto pl-6">
        <div className="max-w-7xl mx-auto">
          {/* Mobile-first header */}
          <div className="mb-8 px-4 sm:px-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Mis Rutas</h1>
            <p className="text-sm sm:text-base text-gray-600">Tu progreso y cursos guardados</p>
          </div>

          {/* Mobile-first carousels */}
          <div className="space-y-8 sm:space-y-12">
            <TouchCarousel
              title="Continúa escuchando"
              courses={continueLearningCourses}
              showProgress={true}
              onPlayCourse={handlePlayCourse}
              onToggleSave={handleToggleSave}
              onCourseClick={handleCourseClick}
            />

            {/* Mobile-first saved courses */}
            <div className="px-4 sm:px-0">
              <h2 className="text-xl sm:text-2xl font-bold mb-6">Guardados</h2>
              {savedCourses.length === 0 ? (
                <div className="text-gray-500 text-center py-12 text-sm sm:text-base">
                  No tienes cursos guardados
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {savedCourses.map(course => {
                    const progress = userProgress.find(p => p.course_id === course.id);
                    const progressPercentage = progress?.progress_percentage || 0;
                    console.log(`🚀 OPTIMIZED MyRoutes Saved: Course ${course.id} progress: ${progressPercentage}%`);
                    return (
                      <div key={course.id} className="h-full">
                        <CourseCardWithProgress
                          podcast={course}
                          progress={progressPercentage}
                          isPlaying={false}
                          isSaved={true}
                          showProgress={progressPercentage > 0}
                          onPlay={() => handlePlayCourse(course.id)}
                          onToggleSave={() => handleToggleSave(course.id)}
                          onClick={() => handleCourseClick(course.id)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mobile-first completed courses */}
            <div className="px-4 sm:px-0">
              <h2 className="text-xl sm:text-2xl font-bold mb-6">Terminados</h2>
              {completedCourses.length === 0 ? (
                <div className="text-gray-500 text-center py-12 text-sm sm:text-base">
                  No has completado ningún curso aún
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {completedCourses.map(course => {
                    const progress = userProgress.find(p => p.course_id === course.id);
                    return (
                      <div key={course.id} className="h-full">
                        <CourseCardWithProgress
                          podcast={course}
                          progress={100}
                          isPlaying={false}
                          isSaved={progress?.is_saved || false}
                          showProgress={true}
                          onPlay={() => handlePlayCourse(course.id)}
                          onToggleSave={() => handleToggleSave(course.id)}
                          onClick={() => handleCourseClick(course.id)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardMyRoutesOptimized;