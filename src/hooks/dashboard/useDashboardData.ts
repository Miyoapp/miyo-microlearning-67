
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { obtenerCursos } from '@/lib/api';
import { useUserProgress } from '@/hooks/useUserProgress';
import { Podcast } from '@/types';

interface UserProfile {
  name: string;
  created_at: string;
}

export const useDashboardData = () => {
  const { user } = useAuth();
  const [allCourses, setAllCourses] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean>(false);
  const { userProgress, toggleSaveCourse, refetch } = useUserProgress();

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        console.log('👤 No user found for dashboard data');
        setUserName('Usuario');
        setIsFirstTimeUser(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('name, created_at')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error loading user profile:', error);
          setUserName(user.email || 'Usuario');
          setIsFirstTimeUser(false);
          return;
        }
        
        if (profile) {
          setUserName(profile.name || user.email || 'Usuario');
          
          // Determinar si es primera vez basado en si se creó hoy
          const createdDate = new Date(profile.created_at);
          const today = new Date();
          const isToday = createdDate.toDateString() === today.toDateString();
          setIsFirstTimeUser(isToday);
        } else {
          // No profile found - might be a new user
          console.log('📝 No profile found for user, using defaults');
          setUserName(user.email || 'Usuario');
          setIsFirstTimeUser(true);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        setUserName(user.email || 'Usuario');
        setIsFirstTimeUser(false);
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

  return {
    allCourses,
    loading,
    userName,
    isFirstTimeUser,
    userProgress,
    toggleSaveCourse,
    refetch,
  };
};
