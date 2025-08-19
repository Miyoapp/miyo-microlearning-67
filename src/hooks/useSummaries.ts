
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { CourseSummary } from '@/types/notes';

export function useSummaries() {
  const [summaries, setSummaries] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchSummaries = useCallback(async (courseId: string) => {
    if (!user || !courseId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('course_summaries' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSummaries((data as CourseSummary[]) || []);
    } catch (error) {
      console.error('Error fetching summaries:', error);
      toast.error('Error al cargar los resúmenes');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createSummary = useCallback(async (
    courseId: string, 
    title: string, 
    content: string, 
    summaryType: 'personal' | 'highlights' | 'insights' = 'personal'
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('course_summaries' as any)
        .insert({
          user_id: user.id,
          course_id: courseId,
          title,
          summary_content: content,
          summary_type: summaryType
        })
        .select()
        .single();

      if (error) throw error;
      
      const newSummary = data as CourseSummary;
      setSummaries(prev => [newSummary, ...prev]);
      toast.success('Resumen creado exitosamente');
      return newSummary;
    } catch (error) {
      console.error('Error creating summary:', error);
      toast.error('Error al crear el resumen');
    }
  }, [user]);

  const getCourseStats = useCallback(async (courseId: string) => {
    if (!user) return null;

    try {
      // Get total notes for this course
      const { data: notesData, error: notesError } = await supabase
        .from('lesson_notes' as any)
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId);

      if (notesError) throw notesError;

      // Get lesson progress for this course
      const { data: progressData, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId);

      if (progressError) throw progressError;

      return {
        totalNotes: notesData?.length || 0,
        completedLessons: progressData?.filter(p => p.is_completed).length || 0,
        totalLessons: progressData?.length || 0
      };
    } catch (error) {
      console.error('Error getting course stats:', error);
      return null;
    }
  }, [user]);

  return {
    summaries,
    loading,
    fetchSummaries,
    createSummary,
    getCourseStats
  };
}
