
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CourseCardWithProgress from '@/components/dashboard/CourseCardWithProgress';
import { Button } from '@/components/ui/button';
import { obtenerCursos, obtenerCategorias } from '@/lib/api';
import { useUserProgress } from '@/hooks/useUserProgress';
import { Podcast, CategoryModel } from '@/types';

const DashboardDiscover = () => {
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState<Podcast[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { userProgress, toggleSaveCourse } = useUserProgress();

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

  // Get new courses (simulate last 30 days)
  const newCourses = allCourses.slice(0, 6);

  const handlePlayCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}`);
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Descubrir</h1>
          <p className="text-gray-600">Explora nuevos cursos y temas</p>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Categorías</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null ? "bg-miyo-800 hover:bg-miyo-900" : ""}
            >
              Todos
            </Button>
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? "bg-miyo-800 hover:bg-miyo-900" : ""}
              >
                {category.nombre}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => {
              const progress = userProgress.find(p => p.course_id === course.id);
              return (
                <CourseCardWithProgress
                  key={course.id}
                  podcast={course}
                  progress={progress?.progress_percentage || 0}
                  isPlaying={false}
                  isSaved={progress?.is_saved || false}
                  showProgress={false}
                  onPlay={() => handlePlayCourse(course.id)}
                  onToggleSave={() => toggleSaveCourse(course.id)}
                  onClick={() => handleCourseClick(course.id)}
                />
              );
            })}
          </div>
        </div>

        {/* New Courses */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Nuevos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newCourses.map(course => {
              const progress = userProgress.find(p => p.course_id === course.id);
              return (
                <CourseCardWithProgress
                  key={course.id}
                  podcast={course}
                  progress={progress?.progress_percentage || 0}
                  isPlaying={false}
                  isSaved={progress?.is_saved || false}
                  showProgress={false}
                  onPlay={() => handlePlayCourse(course.id)}
                  onToggleSave={() => toggleSaveCourse(course.id)}
                  onClick={() => handleCourseClick(course.id)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardDiscover;
