
import { useState, useCallback, useEffect } from 'react';
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

export function useAllSummaries() {
  const [summaries, setSummaries] = useState<EnrichedSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAllSummaries = useCallback(async () => {
    if (!user) {
      setSummaries([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      // Get summaries with course and category data
      const { data: summariesData, error: summariesError } = await supabase
        .from('course_summaries')
        .select(`
          *,
          cursos!inner(titulo, categoria_id, categorias(nombre))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (summariesError) throw summariesError;

      if (!summariesData) {
        setSummaries([]);
        return;
      }

      // Get action plan items for all summaries
      const summaryIds = summariesData.map(s => s.id);
      let actionPlansData = [];
      
      if (summaryIds.length > 0) {
        const { data: actionData, error: actionError } = await supabase
          .from('action_plan_items')
          .select('*')
          .in('summary_id', summaryIds);

        if (actionError) {
          console.error('Error fetching action plans:', actionError);
        } else {
          actionPlansData = actionData || [];
        }
      }

      // Process and enrich summaries
      const enrichedSummaries: EnrichedSummary[] = summariesData.map(summary => {
        const curso = summary.cursos;
        const categoria = curso?.categorias;
        
        // Get action plans for this summary
        const summaryActions = actionPlansData.filter(action => action.summary_id === summary.id);
        const completedActions = summaryActions.filter(action => action.is_completed).length;

        // Create insight preview (first 100 chars)
        const insightPreview = summary.personal_insight 
          ? summary.personal_insight.length > 100 
            ? summary.personal_insight.substring(0, 100) + '...'
            : summary.personal_insight
          : '';

        // Count key concepts
        const keyConceptsCount = summary.key_concepts 
          ? summary.key_concepts.split('\n').filter(concept => concept.trim()).length
          : 0;

        return {
          ...summary,
          course_title: curso?.titulo || 'Curso sin título',
          category_name: categoria?.nombre || 'Sin categoría',
          category_icon: getCategoryIcon(categoria?.nombre || ''),
          insight_preview: insightPreview,
          key_concepts_count: keyConceptsCount,
          total_actions: summaryActions.length,
          completed_actions: completedActions
        };
      });

      setSummaries(enrichedSummaries);
    } catch (error) {
      console.error('Error fetching all summaries:', error);
      setSummaries([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteSummary = useCallback(async (summaryId: string) => {
    if (!user) return false;

    try {
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

      // Update local state
      setSummaries(prev => prev.filter(s => s.id !== summaryId));
      return true;
    } catch (error) {
      console.error('Error deleting summary:', error);
      return false;
    }
  }, [user]);

  useEffect(() => {
    fetchAllSummaries();
  }, [fetchAllSummaries]);

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
