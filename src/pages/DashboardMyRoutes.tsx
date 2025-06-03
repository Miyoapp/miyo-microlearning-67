
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CourseCarousel from '@/components/dashboard/CourseCarousel';
import CourseCardWithProgress from '@/components/dashboard/CourseCardWithProgress';
import { obtenerCursos } from '@/lib/api';
import { useUserProgress } from '@/hooks/useUserProgress';
import { Podcast } from '@/types';

const DashboardMyRoutes = () => {
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProgress, toggleSaveCourse } = useUserProgress();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const courses = await obtenerCursos();
        setAllCourses(courses);
      } catch (error) {
        console.error('Error loading courses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  // Get courses in progress
  const continueLearningCourses = allCourses
    .map(course => {
      const progress = userProgress.find(p => p.course_id === course.id);
      return {
        podcast: course,
        progress: progress?.progress_percentage || 0,
        isPlaying: false,
        isSaved: progress?.is_saved || false
      };
    })
    .filter(course => course.progress > 0 && course.progress < 100);

  // Get saved courses
  const savedCourses = allCourses
    .filter(course => {
      const progress = userProgress.find(p => p.course_id === course.id);
      return progress?.is_saved;
    });

  // Get completed courses
  const completedCourses = allCourses
    .filter(course => {
      const progress = userProgress.find(p => p.course_id === course.id);
      return progress?.is_completed;
    });

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Rutas</h1>
          <p className="text-gray-600">Tu progreso y cursos guardados</p>
        </div>

        <CourseCarousel
          title="Continúa escuchando"
          courses={continueLearningCourses}
          showProgress={true}
          onPlayCourse={handlePlayCourse}
          onToggleSave={toggleSaveCourse}
          onCourseClick={handleCourseClick}
        />

        {/* Saved Courses */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Guardados</h2>
          {savedCourses.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No tienes cursos guardados
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedCourses.map(course => {
                const progress = userProgress.find(p => p.course_id === course.id);
                return (
                  <CourseCardWithProgress
                    key={course.id}
                    podcast={course}
                    progress={progress?.progress_percentage || 0}
                    isPlaying={false}
                    isSaved={true}
                    showProgress={false}
                    onPlay={() => handlePlayCourse(course.id)}
                    onToggleSave={() => toggleSaveCourse(course.id)}
                    onClick={() => handleCourseClick(course.id)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Courses */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Terminados</h2>
          {completedCourses.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No has completado ningún curso aún
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedCourses.map(course => {
                const progress = userProgress.find(p => p.course_id === course.id);
                return (
                  <CourseCardWithProgress
                    key={course.id}
                    podcast={course}
                    progress={100}
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
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardMyRoutes;
