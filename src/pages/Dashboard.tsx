
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CourseCarousel from '@/components/dashboard/CourseCarousel';
import { useCourseData } from '@/hooks/useCourseData';
import { useUserProgress } from '@/hooks/useUserProgress';
import { obtenerCursos } from '@/lib/api';
import { useState, useEffect } from 'react';
import { Podcast } from '@/types';

const Dashboard = () => {
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

  // Get courses with progress
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
    .filter(course => course.progress > 0 && course.progress < 100)
    .sort((a, b) => {
      const aProgress = userProgress.find(p => p.course_id === a.podcast.id);
      const bProgress = userProgress.find(p => p.course_id === b.podcast.id);
      return new Date(bProgress?.last_listened_at || 0).getTime() - 
             new Date(aProgress?.last_listened_at || 0).getTime();
    });

  // Get recommended courses (for now, just show courses user hasn't started)
  const recommendedCourses = allCourses
    .map(course => {
      const progress = userProgress.find(p => p.course_id === course.id);
      return {
        podcast: course,
        progress: progress?.progress_percentage || 0,
        isPlaying: false,
        isSaved: progress?.is_saved || false
      };
    })
    .filter(course => course.progress === 0)
    .slice(0, 6);

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Bienvenido de vuelta!</h1>
          <p className="text-gray-600">Continúa tu aprendizaje donde lo dejaste</p>
        </div>

        <CourseCarousel
          title="Continúa escuchando"
          courses={continueLearningCourses}
          showProgress={true}
          onPlayCourse={handlePlayCourse}
          onToggleSave={toggleSaveCourse}
          onCourseClick={handleCourseClick}
        />

        <CourseCarousel
          title="Para ti"
          courses={recommendedCourses}
          showProgress={false}
          onPlayCourse={handlePlayCourse}
          onToggleSave={toggleSaveCourse}
          onCourseClick={handleCourseClick}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
