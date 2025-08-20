import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { CourseSummary, ActionPlanItem } from '@/types/notes';

export function useSummaries() {
  const [summaries, setSummaries] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchSummaries = useCallback(async (courseId: string): Promise<CourseSummary[]> => {
    if (!user || !courseId) return [];
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('course_summaries')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedData = (data || []) as CourseSummary[];
      setSummaries(typedData);
      return typedData;
    } catch (error) {
      console.error('Error fetching summaries:', error);
      toast.error('Error al cargar los resúmenes');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createSummary = useCallback(async (
    courseId: string, 
    title: string, 
    content: string, 
    summaryType: 'personal' | 'highlights' | 'insights' = 'personal',
    keyConcepts?: string,
    personalInsight?: string,
    actionPlans?: string[]
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('course_summaries')
        .insert({
          user_id: user.id,
          course_id: courseId,
          title,
          summary_content: content,
          summary_type: summaryType,
          key_concepts: keyConcepts,
          personal_insight: personalInsight
        })
        .select()
        .single();

      if (error) throw error;
      
      const newSummary = data as CourseSummary;

      // Create action plan items if provided
      if (actionPlans && actionPlans.length > 0) {
        const actionPlanItems = actionPlans.map(plan => ({
          summary_id: newSummary.id,
          text: plan,
          is_completed: false
        }));

        const { error: actionPlanError } = await supabase
          .from('action_plan_items')
          .insert(actionPlanItems);

        if (actionPlanError) {
          console.error('Error creating action plan items:', actionPlanError);
        }
      }
      
      setSummaries(prev => [newSummary, ...prev]);
      toast.success('Resumen creado exitosamente');
      return newSummary;
    } catch (error) {
      console.error('Error creating summary:', error);
      toast.error('Error al crear el resumen');
    }
  }, [user]);

  const updateSummary = useCallback(async (summaryId: string, updates: { key_concepts?: string; personal_insight?: string }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('course_summaries')
        .update(updates)
        .eq('id', summaryId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setSummaries(prev => prev.map(summary => 
        summary.id === summaryId 
          ? { ...summary, ...updates }
          : summary
      ));

      toast.success('Resumen actualizado exitosamente');
    } catch (error) {
      console.error('Error updating summary:', error);
      toast.error('Error al actualizar el resumen');
    }
  }, [user]);

  const getCourseStats = useCallback(async (courseId: string) => {
    if (!user) return null;

    try {
      // Get total notes for this course
      const { data: notesData, error: notesError } = await supabase
        .from('lesson_notes')
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

  const hasSummary = useCallback(async (courseId: string) => {
    if (!user || !courseId) return false;

    try {
      const { data, error } = await supabase
        .from('course_summaries')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .limit(1);

      if (error) throw error;
      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('Error checking if has summary:', error);
      return false;
    }
  }, [user]);

  const fetchActionPlanItems = useCallback(async (summaryId: string) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('action_plan_items')
        .select('*')
        .eq('summary_id', summaryId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching action plan items:', error);
      return [];
    }
  }, [user]);

  const updateActionPlanItem = useCallback(async (itemId: string, updates: Partial<ActionPlanItem>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('action_plan_items')
        .update(updates)
        .eq('id', itemId);

      if (error) throw error;
      toast.success('Plan de acción actualizado');
    } catch (error) {
      console.error('Error updating action plan item:', error);
      toast.error('Error al actualizar el plan de acción');
    }
  }, [user]);

  const deleteActionPlanItem = useCallback(async (itemId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('action_plan_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      toast.success('Plan de acción eliminado');
    } catch (error) {
      console.error('Error deleting action plan item:', error);
      toast.error('Error al eliminar el plan de acción');
    }
  }, [user]);

  return {
    summaries,
    loading,
    fetchSummaries,
    createSummary,
    updateSummary,
    getCourseStats,
    hasSummary,
    fetchActionPlanItems,
    updateActionPlanItem,
    deleteActionPlanItem
  };
}
