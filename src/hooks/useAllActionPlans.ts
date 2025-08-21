
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { ActionPlanItem } from '@/types/notes';

export interface EnrichedActionPlan extends ActionPlanItem {
  course_title: string;
  category_name: string;
  category_icon?: string;
  summary_title: string;
}

export function useAllActionPlans() {
  const [actionPlans, setActionPlans] = useState<EnrichedActionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchAllActionPlans = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    console.log('Fetching action plans for user:', user.id);
    
    try {
      const { data: actionPlansData, error } = await supabase
        .from('action_plan_items')
        .select(`
          *,
          course_summaries (
            title,
            course_id,
            cursos (
              titulo,
              categorias (
                id,
                nombre
              )
            )
          )
        `)
        .order('created_at', { ascending: false });

      console.log('Raw action plans data:', actionPlansData);
      console.log('Query error (if any):', error);

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
      
      const enrichedPlans: EnrichedActionPlan[] = (actionPlansData || [])
        .filter(plan => {
          const hasValidSummary = plan.course_summaries && 
                                  plan.course_summaries.cursos && 
                                  plan.course_summaries.cursos.categorias;
          
          if (!hasValidSummary) {
            console.warn('Filtered out plan due to missing related data:', plan);
          }
          
          return hasValidSummary;
        })
        .map(plan => {
          const summary = plan.course_summaries as any;
          const course = summary.cursos;
          const category = course?.categorias;
          
          return {
            id: plan.id,
            summary_id: plan.summary_id,
            text: plan.text,
            is_completed: plan.is_completed,
            created_at: plan.created_at,
            updated_at: plan.updated_at,
            course_title: course?.titulo || 'Curso sin título',
            category_name: category?.nombre || 'Sin categoría',
            category_icon: '📚', // Default icon, could be enhanced later
            summary_title: summary.title || 'Sin título'
          };
        });

      console.log('Enriched plans:', enrichedPlans);
      setActionPlans(enrichedPlans);
      
      if (enrichedPlans.length === 0) {
        console.log('No action plans found for user');
      }
      
    } catch (error) {
      console.error('Error fetching action plans:', error);
      toast.error('Error al cargar los planes de acción');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const toggleComplete = useCallback(async (planId: string, currentState: boolean) => {
    const newCompletedState = !currentState;
    
    // Optimistic update
    setActionPlans(prev => 
      prev.map(plan => 
        plan.id === planId 
          ? { ...plan, is_completed: newCompletedState }
          : plan
      )
    );

    try {
      const { error } = await supabase
        .from('action_plan_items')
        .update({ is_completed: newCompletedState })
        .eq('id', planId);

      if (error) throw error;
      
      toast.success(newCompletedState ? 'Plan marcado como completado' : 'Plan marcado como pendiente');
    } catch (error) {
      console.error('Error updating action plan:', error);
      // Revert optimistic update
      setActionPlans(prev => 
        prev.map(plan => 
          plan.id === planId 
            ? { ...plan, is_completed: currentState }
            : plan
        )
      );
      toast.error('Error al actualizar el plan');
    }
  }, []);

  const deleteActionPlan = useCallback(async (planId: string) => {
    try {
      const { error } = await supabase
        .from('action_plan_items')
        .delete()
        .eq('id', planId);

      if (error) throw error;
      
      setActionPlans(prev => prev.filter(plan => plan.id !== planId));
      toast.success('Plan eliminado exitosamente');
      return true;
    } catch (error) {
      console.error('Error deleting action plan:', error);
      toast.error('Error al eliminar el plan');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchAllActionPlans();
  }, [fetchAllActionPlans]);

  return {
    actionPlans,
    loading,
    fetchAllActionPlans,
    toggleComplete,
    deleteActionPlan
  };
}
