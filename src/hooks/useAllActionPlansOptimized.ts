import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

const actionPlansQueryKeys = {
  all: ['actionPlans'] as const,
  user: (userId: string) => [...actionPlansQueryKeys.all, 'user', userId] as const,
};

export function useAllActionPlansOptimized() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: actionPlans = [],
    isLoading: loading,
    refetch: fetchAllActionPlans
  } = useQuery({
    queryKey: actionPlansQueryKeys.user(user?.id || ''),
    queryFn: async (): Promise<EnrichedActionPlan[]> => {
      if (!user) return [];

      // Single optimized query with JOINs
      const { data: actionPlansData, error } = await supabase
        .from('action_plan_items')
        .select(`
          *,
          course_summaries!inner (
            id,
            title,
            course_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching action plans:', error);
        throw error;
      }

      if (!actionPlansData || actionPlansData.length === 0) {
        return [];
      }

      // Get course data separately for better performance
      const courseIds = [...new Set(actionPlansData.map(plan => plan.course_summaries.course_id))];
      const { data: coursesData, error: coursesError } = await supabase
        .from('cursos')
        .select(`
          id,
          titulo,
          categorias!inner (
            id,
            nombre
          )
        `)
        .in('id', courseIds);

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        throw coursesError;
      }

      // Create course lookup map
      const coursesMap = new Map();
      (coursesData || []).forEach(course => {
        coursesMap.set(course.id, course);
      });

      // Transform data efficiently
      return (actionPlansData || []).map(plan => {
        const summary = plan.course_summaries;
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
          category_icon: getCategoryIcon(category?.nombre || ''),
          summary_title: summary.title
        };
      });
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const toggleCompleteMutation = useMutation({
    mutationFn: async ({ planId, newState }: { planId: string; newState: boolean }) => {
      const { error } = await supabase
        .from('action_plan_items')
        .update({ is_completed: newState })
        .eq('id', planId);

      if (error) throw error;
      return { planId, newState };
    },
    onMutate: async ({ planId, newState }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: actionPlansQueryKeys.user(user?.id || '') });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<EnrichedActionPlan[]>(
        actionPlansQueryKeys.user(user?.id || '')
      );

      // Optimistically update
      queryClient.setQueryData<EnrichedActionPlan[]>(
        actionPlansQueryKeys.user(user?.id || ''),
        (old = []) => old.map(plan => 
          plan.id === planId ? { ...plan, is_completed: newState } : plan
        )
      );

      return { previousData };
    },
    onError: (error, { planId }, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          actionPlansQueryKeys.user(user?.id || ''),
          context.previousData
        );
      }
      console.error('Error updating action plan:', error);
      toast.error('Error al actualizar el plan');
    },
    onSuccess: ({ newState }) => {
      toast.success(newState ? 'Plan marcado como completado' : 'Plan marcado como pendiente');
    },
  });

  const deleteActionPlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('action_plan_items')
        .delete()
        .eq('id', planId);

      if (error) throw error;
      return planId;
    },
    onSuccess: (planId) => {
      // Update cache
      queryClient.setQueryData<EnrichedActionPlan[]>(
        actionPlansQueryKeys.user(user?.id || ''),
        (old = []) => old.filter(plan => plan.id !== planId)
      );
      toast.success('Plan eliminado exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting action plan:', error);
      toast.error('Error al eliminar el plan');
    },
  });

  const toggleComplete = (planId: string, currentState: boolean) => {
    toggleCompleteMutation.mutate({ planId, newState: !currentState });
  };

  const deleteActionPlan = (planId: string) => {
    return deleteActionPlanMutation.mutateAsync(planId);
  };

  return {
    actionPlans,
    loading,
    fetchAllActionPlans,
    toggleComplete,
    deleteActionPlan
  };
}

// Helper function to get category icons
function getCategoryIcon(categoryName: string): string {
  const iconMap: { [key: string]: string } = {
    'Desarrollo Personal': '🧠',
    'Liderazgo': '👑',
    'Comunicación': '💬',
    'Productividad': '⚡',
    'Emprendimiento': '🚀',
    'Ventas': '💰',
    'Marketing': '📈',
    'Tecnología': '💻',
    'Finanzas': '💳',
    'Salud': '🏥'
  };
  
  return iconMap[categoryName] || '📚';
}