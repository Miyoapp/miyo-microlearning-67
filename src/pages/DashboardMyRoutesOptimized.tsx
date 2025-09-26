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
 * OPTIMIZED: Dashboard My Routes que usa React Query para caché inteligente
 * Reduce las consultas de 30+ a solo 2 consultas cacheadas
 */
const DashboardMyRoutesOptimized = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // OPTIMIZED: Cached courses data
  const { 
    allCourses,
    isLoading: coursesLoading,
    error: coursesError 
  } = useCachedCoursesFiltered();
  
  // OPTIMIZED: Cached user progress with derived functions
  const { 
    userProgress,
    getContinueLearningCourses,
    getSavedCourses,
    getCompletedCourses,
    isLoading: progressLoading,
    refetch 
  } = useCachedProgressData();
  
  // OPTIMIZED: Cached mutations
  const toggleSaveCourseMutation = useToggleSaveCourse();

  // OPTIMIZED: Use cached derived functions
  const continueLearningCourses = getContinueLearningCourses(allCourses);
  const savedCourses = getSavedCourses(allCourses);
  const completedCourses = getCompletedCourses(allCourses);

  const handlePlayCourse = async (courseId: string) => {
    console.log('🚀 OPTIMIZED My Routes: Navigating to course:', courseId);
    navigate(`/dashboard/course/${courseId}`);
  };

  const handleToggleSave = async (courseId: string) => {
    console.log('🚀 OPTIMIZED My Routes: Toggling save for course:', courseId);
    await toggleSaveCourseMutation.mutateAsync(courseId);
    // Note: No need to refetch due to optimistic updates
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/dashboard/course/${courseId}`);
  };

  const loading = coursesLoading || progressLoading;

  console.log('📊 OPTIMIZED MY ROUTES RENDER:', {
    allCoursesCount: allCourses.length,
    continueLearningCount: continueLearningCourses.length,
    savedCount: savedCourses.length,
    completedCount: completedCourses.length,
    userProgressCount: userProgress.length,
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

          {/* Mobile-first carousels - OPTIMIZED */}
          <div className="space-y-8 sm:space-y-12">
            <TouchCarousel
              title="Continúa escuchando"
              courses={continueLearningCourses}
              showProgress={true}
              onPlayCourse={handlePlayCourse}
              onToggleSave={handleToggleSave}
              onCourseClick={handleCourseClick}
            />

            {/* Mobile-first saved courses - OPTIMIZED */}
            <div className="px-4 sm:px-0">
              <h2 className="text-xl sm:text-2xl font-bold mb-6">Guardados</h2>
              {savedCourses.length === 0 ? (
                <div className="text-gray-500 text-center py-12 text-sm sm:text-base">
                  No tienes cursos guardados
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {savedCourses.map(courseData => {
                    const { podcast: course, progress, isSaved } = courseData;
                    return (
                      <div key={course.id} className="h-full">
                        <CourseCardWithProgress
                          podcast={course}
                          progress={progress}
                          isPlaying={false}
                          isSaved={isSaved}
                          showProgress={progress > 0}
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

            {/* Mobile-first completed courses - OPTIMIZED */}
            <div className="px-4 sm:px-0">
              <h2 className="text-xl sm:text-2xl font-bold mb-6">Terminados</h2>
              {completedCourses.length === 0 ? (
                <div className="text-gray-500 text-center py-12 text-sm sm:text-base">
                  No has completado ningún curso aún
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {completedCourses.map(courseData => {
                    const { podcast: course, isSaved } = courseData;
                    return (
                      <div key={course.id} className="h-full">
                        <CourseCardWithProgress
                          podcast={course}
                          progress={100}
                          isPlaying={false}
                          isSaved={isSaved}
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