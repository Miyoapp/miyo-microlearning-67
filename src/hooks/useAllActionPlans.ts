
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
      // First get action plan items with their summaries
      const { data: actionPlansData, error: actionPlansError } = await supabase
        .from('action_plan_items')
        .select(`
          *,
          course_summaries (
            id,
            title,
            course_id
          )
        `)
        .order('created_at', { ascending: false });

      console.log('Raw action plans data:', actionPlansData);
      console.log('Action plans query error (if any):', actionPlansError);

      if (actionPlansError) {
        console.error('Supabase query error:', actionPlansError);
        throw actionPlansError;
      }

      if (!actionPlansData || actionPlansData.length === 0) {
        console.log('No action plans found');
        setActionPlans([]);
        return;
      }

      // Get all unique course IDs
      const courseIds = [...new Set(
        actionPlansData
          .filter(plan => plan.course_summaries?.course_id)
          .map(plan => plan.course_summaries!.course_id)
      )];

      if (courseIds.length === 0) {
        console.log('No valid course IDs found');
        setActionPlans([]);
        return;
      }

      // Get course details with categories
      const { data: coursesData, error: coursesError } = await supabase
        .from('cursos')
        .select(`
          id,
          titulo,
          categoria_id,
          categorias (
            id,
            nombre
          )
        `)
        .in('id', courseIds);

      console.log('Courses data:', coursesData);
      console.log('Courses query error (if any):', coursesError);

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        throw coursesError;
      }

      // Create a map for quick course lookup
      const coursesMap = new Map();
      (coursesData || []).forEach(course => {
        coursesMap.set(course.id, course);
      });

      // Enrich action plans with course and category data
      const enrichedPlans: EnrichedActionPlan[] = actionPlansData
        .filter(plan => {
          const hasValidSummary = plan.course_summaries?.course_id;
          
          if (!hasValidSummary) {
            console.warn('Filtered out plan due to missing course_summaries:', plan);
          }
          
          return hasValidSummary;
        })
        .map(plan => {
          const summary = plan.course_summaries!;
          const course = coursesMap.get(summary.course_id);
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
        })
        .filter(plan => plan.course_title !== 'Curso sin título'); // Filter out plans without valid course data

      console.log('Enriched plans:', enrichedPlans);
      setActionPlans(enrichedPlans);
      
      if (enrichedPlans.length === 0) {
        console.log('No valid action plans found after enrichment');
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
