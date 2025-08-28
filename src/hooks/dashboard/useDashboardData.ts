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