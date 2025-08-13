
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

export interface CourseSummary {
  id: string;
  user_id: string;
  course_id: string;
  title: string;
  summary_content: string;
  summary_type: string;
  created_at: string;
  updated_at: string;
}

export function useCourseSummary(courseId: string | null) {
  const [summaries, setSummaries] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchSummaries = useCallback(async () => {
    if (!user || !courseId) {
      setSummaries([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('course_summaries')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSummaries(data || []);
    } catch (error) {
      console.error('Error fetching summaries:', error);
      toast.error('Error al cargar los resúmenes');
    } finally {
      setLoading(false);
    }
  }, [user, courseId]);

  const createSummary = useCallback(async (title: string, content: string, type: string = 'personal') => {
    if (!user || !courseId) return;

    try {
      const { data, error } = await supabase
        .from('course_summaries')
        .insert({
          user_id: user.id,
          course_id: courseId,
          title,
          summary_content: content,
          summary_type: type
        })
        .select()
        .single();

      if (error) throw error;
      
      setSummaries(prev => [data, ...prev]);
      toast.success('Resumen creado exitosamente');
      
      return data;
    } catch (error) {
      console.error('Error creating summary:', error);
      toast.error('Error al crear el resumen');
    }
  }, [user, courseId]);

  const updateSummary = useCallback(async (summaryId: string, title: string, content: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('course_summaries')
        .update({ 
          title, 
          summary_content: content 
        })
        .eq('id', summaryId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setSummaries(prev => prev.map(summary => summary.id === summaryId ? data : summary));
      toast.success('Resumen actualizado');
    } catch (error) {
      console.error('Error updating summary:', error);
      toast.error('Error al actualizar el resumen');
    }
  }, [user]);

  const deleteSummary = useCallback(async (summaryId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('course_summaries')
        .delete()
        .eq('id', summaryId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setSummaries(prev => prev.filter(summary => summary.id !== summaryId));
      toast.success('Resumen eliminado');
    } catch (error) {
      console.error('Error deleting summary:', error);
      toast.error('Error al eliminar el resumen');
    }
  }, [user]);

  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

  return {
    summaries,
    loading,
    createSummary,
    updateSummary,
    deleteSummary,
    refetch: fetchSummaries
  };
}
