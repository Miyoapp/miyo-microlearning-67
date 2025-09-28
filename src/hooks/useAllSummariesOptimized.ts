import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { CourseSummary } from '@/types/notes';

export interface EnrichedSummary extends CourseSummary {
  course_title: string;
  category_name: string;
  category_icon?: string;
  insight_preview: string;
  key_concepts_count: number;
  total_actions: number;
  completed_actions: number;
}

const summariesQueryKeys = {
  all: ['summaries'] as const,
  user: (userId: string) => [...summariesQueryKeys.all, 'user', userId] as const,
};

export function useAllSummariesOptimized() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: summaries = [],
    isLoading: loading,
    refetch: fetchAllSummaries
  } = useQuery({
    queryKey: summariesQueryKeys.user(user?.id || ''),
    queryFn: async (): Promise<EnrichedSummary[]> => {
      if (!user) return [];

      // Single optimized query with JOINs
      const { data: summariesData, error } = await supabase
        .from('course_summaries')
        .select(`
          *,
          action_plan_items (
            id,
            is_completed
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching summaries:', error);
        throw error;
      }

      if (!summariesData || summariesData.length === 0) {
        return [];
      }

      // Get course data separately for better performance
      const courseIds = [...new Set(summariesData.map(summary => summary.course_id))];
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

      // Transform and enrich data efficiently
      return (summariesData || []).map(summary => {
        const course = coursesMap.get(summary.course_id);
        const category = course?.categorias;
        const actionPlans = summary.action_plan_items || [];
        
        // Create insight preview
        const insightPreview = summary.personal_insight 
          ? summary.personal_insight.length > 100 
            ? summary.personal_insight.substring(0, 100) + '...'
            : summary.personal_insight
          : '';

        // Count key concepts
        const keyConceptsCount = summary.key_concepts 
          ? summary.key_concepts.split('\n').filter(concept => concept.trim()).length
          : 0;

        // Count actions
        const totalActions = actionPlans.length;
        const completedActions = actionPlans.filter(action => action.is_completed).length;

        // Handle action_plans JSON field
        let actionPlansArray: any[] = [];
        if (summary.action_plans) {
          try {
            if (typeof summary.action_plans === 'string') {
              actionPlansArray = JSON.parse(summary.action_plans);
            } else if (Array.isArray(summary.action_plans)) {
              actionPlansArray = summary.action_plans;
            }
          } catch (error) {
            console.error('Error parsing action_plans:', error);
            actionPlansArray = [];
          }
        }

        return {
          ...summary,
          action_plans: actionPlansArray,
          course_title: course?.titulo || 'Curso sin título',
          category_name: category?.nombre || 'Sin categoría',
          category_icon: getCategoryIcon(category?.nombre || ''),
          insight_preview: insightPreview,
          key_concepts_count: keyConceptsCount,
          total_actions: totalActions,
          completed_actions: completedActions
        };
      });
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const deleteSummaryMutation = useMutation({
    mutationFn: async (summaryId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Delete action plan items first (foreign key constraint)
      await supabase
        .from('action_plan_items')
        .delete()
        .eq('summary_id', summaryId);

      // Delete the summary
      const { error } = await supabase
        .from('course_summaries')
        .delete()
        .eq('id', summaryId)
        .eq('user_id', user.id);

      if (error) throw error;
      return summaryId;
    },
    onSuccess: (summaryId) => {
      // Update cache
      queryClient.setQueryData<EnrichedSummary[]>(
        summariesQueryKeys.user(user?.id || ''),
        (old = []) => old.filter(s => s.id !== summaryId)
      );
    },
    onError: (error) => {
      console.error('Error deleting summary:', error);
    },
  });

  const deleteSummary = async (summaryId: string): Promise<boolean> => {
    try {
      await deleteSummaryMutation.mutateAsync(summaryId);
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    summaries,
    loading,
    fetchAllSummaries,
    deleteSummary
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