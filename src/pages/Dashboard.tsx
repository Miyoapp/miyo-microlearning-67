
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CourseCarousel from '@/components/dashboard/CourseCarousel';
import { useUserProgress } from '@/hooks/useUserProgress';
import { obtenerCursos } from '@/lib/api';
import { useState, useEffect } from 'react';
import { Podcast } from '@/types';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{ name?: string } | null>(null);
  const { user } = useAuth();
  const { userProgress, toggleSaveCourse, startCourse, refetch } = useUserProgress();

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

  // Fetch user profile when user changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();
        
        setUserProfile(data);
      } else {
        setUserProfile(null);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Refresh user progress when userProgress changes
  useEffect(() => {
    console.log('Dashboard: User progress updated:', userProgress);
  }, [userProgress]);

  // Get courses with progress
  const continueLearningCourses = allCourses
    .map(course => {
      const progress = userProgress.find(p => p.course_id === course.id);
      const progressPercentage = progress?.progress_percentage || 0;
      console.log(`Dashboard: Course ${course.id} progress: ${progressPercentage}%`);
      return {
        podcast: course,
        progress: progressPercentage,
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
      const progressPercentage = progress?.progress_percentage || 0;
      return {
        podcast: course,
        progress: progressPercentage,
        isPlaying: false,
        isSaved: progress?.is_saved || false
      };
    })
    .filter(course => course.progress === 0)
    .slice(0, 6);

  const handlePlayCourse = async (courseId: string) => {
    console.log('Dashboard: Starting course:', courseId);
    // Start the course to add it to continue learning
    await startCourse(courseId);
    // Refresh data to show updated state
    await refetch();
    // Redirect to the new dashboard course view instead of old course view
    navigate(`/dashboard/course/${courseId}`);
  };

  const handleToggleSave = async (courseId: string) => {
    console.log('Dashboard: Toggling save for course:', courseId);
    await toggleSaveCourse(courseId);
    // Refresh data to show updated state
    await refetch();
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/dashboard/course/${courseId}`);
  };

  console.log('Dashboard render - Continue learning courses:', continueLearningCourses.length);
  console.log('Dashboard render - Recommended courses:', recommendedCourses.length);

  // Get user name for welcome message
  const userName = userProfile?.name || user?.email?.split('@')[0] || 'Usuario';

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
      <div className="max-w-7xl mx-auto pb-20 sm:pb-24">
        {/* Mobile-optimized welcome section */}
        <div className="mb-6 sm:mb-8 px-4 sm:px-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight">
            ¡Bienvenido de vuelta, {userName}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Continúa tu aprendizaje donde lo dejaste
          </p>
        </div>

        <CourseCarousel
          title="Continúa escuchando"
          courses={continueLearningCourses}
          showProgress={true}
          onPlayCourse={handlePlayCourse}
          onToggleSave={handleToggleSave}
          onCourseClick={handleCourseClick}
        />

        <CourseCarousel
          title="Para ti"
          courses={recommendedCourses}
          showProgress={false}
          onPlayCourse={handlePlayCourse}
          onToggleSave={handleToggleSave}
          onCourseClick={handleCourseClick}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
