
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CourseCardWithProgress from '@/components/dashboard/CourseCardWithProgress';
import { Button } from '@/components/ui/button';
import { obtenerCursos, obtenerCategorias } from '@/lib/api';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useNewCourses } from '@/hooks/useNewCourses';
import { Podcast, CategoryModel } from '@/types';
import { SidebarTrigger } from '@/components/ui/sidebar/SidebarTrigger';
import { useIsMobile } from '@/hooks/use-mobile';
import { CalendarDays, Sparkles } from 'lucide-react';

const DashboardDiscover = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [allCourses, setAllCourses] = useState<Podcast[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { userProgress, toggleSaveCourse } = useUserProgress();
  const { newCourses, loading: newCoursesLoading, error: newCoursesError } = useNewCourses();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [courses, cats] = await Promise.all([
          obtenerCursos(),
          obtenerCategorias()
        ]);
        setAllCourses(courses);
        setCategories(cats);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredCourses = selectedCategory
    ? allCourses.filter(course => course.category.id === selectedCategory)
    : allCourses;

  const handlePlayCourse = (courseId: string) => {
    console.log('DashboardDiscover: Navigating to course (maintaining current progress):', courseId);
    navigate(`/dashboard/course/${courseId}`);
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
      {/* Mobile hamburger menu - positioned like CoursePageHeader */}
      {isMobile && (
        <div className="mb-4 px-4 flex justify-end">
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

          {/* New Courses Section - NOW BASED ON REAL DATES */}
          <div className="mb-8 px-4 sm:px-0">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="w-5 h-5 text-miyo-800" />
              <h2 className="text-xl sm:text-2xl font-bold">Nuevos</h2>
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </div>
            
            {newCoursesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200 rounded-t-lg"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : newCoursesError ? (
              <div className="text-center py-8 text-gray-600">
                <p>Error al cargar cursos nuevos</p>
              </div>
            ) : (
              <>
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
                          onToggleSave={() => toggleSaveCourse(course.id)}
                          onClick={() => handleCourseClick(course.id)}
                        />
                      </div>
                    );
                  })}
                </div>
              </>
            )}
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
              {categories.map(category => (
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
                      onToggleSave={() => toggleSaveCourse(course.id)}
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

export default DashboardDiscover;
