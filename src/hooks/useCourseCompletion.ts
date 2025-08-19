
import { useState, useEffect, useCallback } from 'react';
import { Podcast } from '@/types';
import { CourseCompletionStats } from '@/types/notes';
import { useSummaries } from '@/hooks/useSummaries';

interface UseCourseCompletionProps {
  podcast: Podcast | null;
  userProgress: any[];
  lessonProgress: any[];
}

export function useCourseCompletion({ podcast, userProgress, lessonProgress }: UseCourseCompletionProps) {
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [completionStats, setCompletionStats] = useState<CourseCompletionStats | null>(null);
  const [hasShownCompletion, setHasShownCompletion] = useState(false);
  
  const { getCourseStats, createSummary } = useSummaries();

  // Check if course is completed
  const checkCourseCompletion = useCallback(async () => {
    if (!podcast || !userProgress || hasShownCompletion) return;

    const courseProgress = userProgress.find(p => p.course_id === podcast.id);
    
    // Only show modal if course just became 100% complete
    if (courseProgress?.is_completed && courseProgress?.progress_percentage === 100) {
      console.log('🎉 Course completed! Showing congratulations modal');
      
      // Get course stats
      const stats = await getCourseStats(podcast.id);
      if (stats) {
        setCompletionStats({
          totalLessons: podcast.lessonCount,
          completedLessons: stats.completedLessons,
          totalNotes: stats.totalNotes,
          totalTimeSpent: podcast.duration * 60,
          courseDuration: podcast.duration * 60
        });
        
        setShowCompletionModal(true);
        setHasShownCompletion(true);
      }
    }
  }, [podcast, userProgress, hasShownCompletion, getCourseStats]);

  // Effect to check completion
  useEffect(() => {
    checkCourseCompletion();
  }, [checkCourseCompletion]);

  // Handle creating summary
  const handleCreateSummary = useCallback(async (title: string, content: string) => {
    if (!podcast) return;
    
    await createSummary(podcast.id, title, content, 'personal');
    setShowSummaryModal(false);
    setShowCompletionModal(false);
  }, [podcast, createSummary]);

  // Handle opening summary modal
  const handleOpenSummaryModal = useCallback(() => {
    setShowCompletionModal(false);
    setShowSummaryModal(true);
  }, []);

  return {
    showCompletionModal,
    showSummaryModal,
    completionStats,
    setShowCompletionModal,
    setShowSummaryModal,
    handleCreateSummary,
    handleOpenSummaryModal
  };
}
