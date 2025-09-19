import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CourseCardWithProgress from '@/components/dashboard/CourseCardWithProgress';
import { Button } from '@/components/ui/button';
import { useCachedCategories } from '@/hooks/queries/useCachedCategories';
import { useCachedCoursesFiltered } from '@/hooks/queries/useCachedCourses';
import { useCachedProgressData, useToggleSaveCourse } from '@/hooks/queries/useCachedUserProgress';
import { CategoryModel } from '@/types';
import { SidebarTrigger } from '@/components/ui/sidebar/index';
import { useIsMobile } from '@/hooks/use-mobile';
import { CalendarDays, Sparkles } from 'lucide-react';

/**
 * OPTIMIZED: Discover page que usa React Query para caché inteligente
 * Reduce las consultas significativamente y reutiliza datos cacheados
 */
const DashboardDiscoverOptimized = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // OPTIMIZED: Use cached courses data
  const { 
    allCourses, 
    getCoursesByCategory, 
    getNewCourses,
    isLoading: coursesLoading, 
    error: coursesError 
  } = useCachedCoursesFiltered();
  
  // OPTIMIZED: Use cached user progress
  const { userProgress, isLoading: progressLoading } = useCachedProgressData();
  
  // OPTIMIZED: Use cached toggle save mutation
  const toggleSaveCourseMutation = useToggleSaveCourse();
  
  // OPTIMIZED: Use cached categories
  const { data: categories = [], isLoading: categoriesLoading } = useCachedCategories();

  const loading = coursesLoading || progressLoading || categoriesLoading;
  
  // OPTIMIZED: Filter courses using cached data
  const filteredCourses = selectedCategory
    ? getCoursesByCategory(selectedCategory)
    : allCourses;
    
  // OPTIMIZED: Get new courses using cached data
  const newCourses = getNewCourses(4);

  const handlePlayCourse = (courseId: string) => {
    console.log('🚀 OPTIMIZED Discover: Navigating to course:', courseId);
    navigate(`/dashboard/course/${courseId}`);
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/dashboard/course/${courseId}`);
  };

  const handleToggleSave = async (courseId: string) => {
    console.log('🚀 OPTIMIZED Discover: Toggling save for course:', courseId);
    await toggleSaveCourseMutation.mutateAsync(courseId);
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
          <div className="mb-6 sm:mb-8 px-4 sm:px-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Descubrir</h1>
            <p className="text-sm sm:text-base text-gray-600">Explora nuevos cursos y temas</p>
          </div>

          {/* New Courses Section */}
          <div className="mb-8 px-4 sm:px-0">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="w-5 h-5 text-miyo-800" />
              <h2 className="text-xl sm:text-2xl font-bold">Nuevos</h2>
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              {newCourses.length > 0 
                ? `${newCourses.length} cursos agregados recientemente` 
                : 'No hay cursos nuevos disponibles'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {newCourses.map(course => {
                const progress = userProgress.find(p => p.course_id === course.id);
                return (
                  <div key={course.id} className="h-full">
                    <CourseCardWithProgress
                      podcast={course}
                      progress={progress?.progress_percentage || 0}
                      isPlaying={false}
                      isSaved={progress?.is_saved || false}
                      showProgress={false}
                      onPlay={() => handlePlayCourse(course.id)}
                      onToggleSave={() => handleToggleSave(course.id)}
                      onClick={() => handleCourseClick(course.id)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Categories Section */}
          <div className="mb-8 px-4 sm:px-0">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Categorías</h2>
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className={`text-xs sm:text-sm ${selectedCategory === null ? "bg-miyo-800 hover:bg-miyo-900" : ""}`}
                size="sm"
              >
                Todos
              </Button>
              {(categories as CategoryModel[]).map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`text-xs sm:text-sm ${selectedCategory === category.id ? "bg-miyo-800 hover:bg-miyo-900" : ""}`}
                  size="sm"
                >
                  {category.nombre}
                </Button>
              ))}
            </div>

            {/* All Courses Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredCourses.map(course => {
                const progress = userProgress.find(p => p.course_id === course.id);
                return (
                  <div key={course.id} className="h-full">
                    <CourseCardWithProgress
                      podcast={course}
                      progress={progress?.progress_percentage || 0}
                      isPlaying={false}
                      isSaved={progress?.is_saved || false}
                      showProgress={false}
                      onPlay={() => handlePlayCourse(course.id)}
                      onToggleSave={() => handleToggleSave(course.id)}
                      onClick={() => handleCourseClick(course.id)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardDiscoverOptimized;