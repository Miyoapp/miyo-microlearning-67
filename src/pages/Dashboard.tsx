
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import TouchCarousel from '@/components/dashboard/TouchCarousel';
import { obtenerCursos } from '@/lib/api';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Podcast } from '@/types';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [allCourses, setAllCourses] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean>(false);
  const { userProgress, toggleSaveCourse, startCourse, refetch } = useUserProgress();

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, created_at')
            .eq('id', user.id)
            .single();
          
          if (profile) {
            setUserName(profile.name || user.email || 'Usuario');
            
            // Determinar si es primera vez basado en si se creó hoy
            const createdDate = new Date(profile.created_at);
            const today = new Date();
            const isToday = createdDate.toDateString() === today.toDateString();
            setIsFirstTimeUser(isToday);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          setUserName(user.email || 'Usuario');
        }
      }
    };

    loadUserData();
  }, [user]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const courses = await obtenerCursos();
        console.log('Dashboard: Loaded courses:', courses.length);
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
      const progressPercentage = progress?.progress_percentage || 0;
      return {
        podcast: course,
        progress: progressPercentage,
        isPlaying: false,
        isSaved: progress?.is_saved || false
      };
    })
    .filter(course => course.progress > 0 && course.progress < 100);

  // Get recommended courses (courses not started)
  const recommendedCourses = allCourses
    .filter(course => {
      const progress = userProgress.find(p => p.course_id === course.id);
      return !progress || progress.progress_percentage === 0;
    })
    .slice(0, 6)
    .map(course => ({
      podcast: course,
      progress: 0,
      isPlaying: false,
      isSaved: userProgress.find(p => p.course_id === course.id)?.is_saved || false
    }));

  // Get premium courses
  const premiumCourses = allCourses
    .filter(course => course.tipo_curso === 'pago')
    .slice(0, 6)
    .map(course => {
      const progress = userProgress.find(p => p.course_id === course.id);
      return {
        podcast: course,
        progress: progress?.progress_percentage || 0,
        isPlaying: false,
        isSaved: progress?.is_saved || false
      };
    });

  const handlePlayCourse = async (courseId: string) => {
    console.log('Dashboard: Starting course:', courseId);
    await startCourse(courseId);
    await refetch();
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

  const welcomeMessage = isFirstTimeUser 
    ? `¡Bienvenido(a), ${userName}!` 
    : `¡Bienvenido(a) de vuelta, ${userName}!`;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto pb-6">
        {/* Mobile-first header */}
        <div className="mb-6 sm:mb-8 px-4 sm:px-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{welcomeMessage}</h1>
          <p className="text-sm sm:text-base text-gray-600">Continúa tu aprendizaje donde lo dejaste</p>
        </div>

        {/* Mobile-first course sections */}
        <div className="space-y-8 sm:space-y-12">
          {continueLearningCourses.length > 0 && (
            <TouchCarousel
              title="Continúa escuchando"
              courses={continueLearningCourses}
              showProgress={true}
              onPlayCourse={handlePlayCourse}
              onToggleSave={handleToggleSave}
              onCourseClick={handleCourseClick}
            />
          )}

          <TouchCarousel
            title="Para ti"
            courses={recommendedCourses}
            showProgress={false}
            onPlayCourse={handlePlayCourse}
            onToggleSave={handleToggleSave}
            onCourseClick={handleCourseClick}
          />

          <TouchCarousel
            title="Cursos Premium"
            courses={premiumCourses}
            showProgress={false}
            onPlayCourse={handlePlayCourse}
            onToggleSave={handleToggleSave}
            onCourseClick={handleCourseClick}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
