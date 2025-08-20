
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const hasShownCompletionRef = useRef(false);
  const previousProgressRef = useRef<number>(0);
  
  const { getCourseStats, createSummary, hasSummary } = useSummaries();

  // Improved course completion detection
  const checkCourseCompletion = useCallback(async () => {
    if (!podcast || !userProgress || hasShownCompletionRef.current) return;

    const courseProgress = userProgress.find(p => p.course_id === podcast.id);
    
    // Check if course just became 100% complete
    if (courseProgress?.is_completed && courseProgress?.progress_percentage === 100) {
      // Only show if we haven't shown it before and this is a new completion
      if (previousProgressRef.current < 100) {
        console.log('🎉 Course just completed! Showing congratulations modal');
        
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
          hasShownCompletionRef.current = true;
        }
      }
    }
    
    // Update previous progress
    if (courseProgress?.progress_percentage !== undefined) {
      previousProgressRef.current = courseProgress.progress_percentage;
    }
  }, [podcast, userProgress, getCourseStats]);

  // Effect to check completion with proper dependencies
  useEffect(() => {
    checkCourseCompletion();
  }, [userProgress, lessonProgress, checkCourseCompletion]);

  // Handle creating summary with new structure
  const handleCreateSummary = useCallback(async (formData: {
    title: string;
    keyConcepts: string;
    personalInsight: string;
    actionPlans: string[];
  }) => {
    if (!podcast) return;
    
    await createSummary(
      podcast.id, 
      formData.title, 
      '', // summary_content can be empty now
      'personal',
      formData.keyConcepts,
      formData.personalInsight,
      formData.actionPlans
    );
    
    setShowSummaryModal(false);
    setShowCompletionModal(false);
  }, [podcast, createSummary]);

  // Handle opening summary modal
  const handleOpenSummaryModal = useCallback(() => {
    setShowCompletionModal(false);
    setShowSummaryModal(true);
  }, []);

  // Handle closing completion modal definitively
  const handleCloseCompletionModal = useCallback(() => {
    setShowCompletionModal(false);
    hasShownCompletionRef.current = true;
  }, []);

  // Check if course has summary for fallback button
  const checkHasSummary = useCallback(async (): Promise<boolean> => {
    if (!podcast) return false;
    return await hasSummary(podcast.id);
  }, [podcast, hasSummary]);

  return {
    showCompletionModal,
    showSummaryModal,
    completionStats,
    setShowCompletionModal: handleCloseCompletionModal,
    setShowSummaryModal,
    handleCreateSummary,
    handleOpenSummaryModal,
    checkHasSummary
  };
}
