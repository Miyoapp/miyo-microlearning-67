
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
  const { userProgress, toggleSaveCourse, startCourse, refetch } = useUserProgress();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const courses = await obtenerCursos();
        console.log('DashboardMyRoutes: Loaded courses:', courses.length);
        setAllCourses(courses);
      } catch (error) {
        console.error('Error loading courses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  // Refresh when userProgress changes
  useEffect(() => {
    console.log('DashboardMyRoutes: User progress updated:', userProgress);
  }, [userProgress]);

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
      const isSaved = progress?.is_saved || false;
      console.log('DashboardMyRoutes: Course', course.id, 'is saved:', isSaved);
      return isSaved;
    });

  // Get completed courses
  const completedCourses = allCourses
    .filter(course => {
      const progress = userProgress.find(p => p.course_id === course.id);
      return progress?.is_completed;
    });

  const handlePlayCourse = async (courseId: string) => {
    console.log('DashboardMyRoutes: Starting course:', courseId);
    await startCourse(courseId);
    await refetch();
    // Redirect to the new dashboard course view instead of old course view
    navigate(`/dashboard/course/${courseId}`);
  };

  const handleToggleSave = async (courseId: string) => {
    console.log('DashboardMyRoutes: Toggling save for course:', courseId);
    await toggleSaveCourse(courseId);
    await refetch();
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/dashboard/course/${courseId}`);
  };

  console.log('DashboardMyRoutes render - Saved courses:', savedCourses.length);
  console.log('DashboardMyRoutes render - Continue learning:', continueLearningCourses.length);

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
          onToggleSave={handleToggleSave}
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
                    onToggleSave={() => handleToggleSave(course.id)}
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
                    onToggleSave={() => handleToggleSave(course.id)}
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
