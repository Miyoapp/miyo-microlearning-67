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
  const isCheckingRef = useRef(false); // Prevent multiple simultaneous checks
  
  const { getCourseStats, createSummary, hasSummary } = useSummaries();
  
  // Use ref to keep stable reference to getCourseStats
  const getCourseStatsRef = useRef(getCourseStats);
  getCourseStatsRef.current = getCourseStats;

  // Stabilized course completion detection
  const checkCourseCompletion = useCallback(async () => {
    console.log('🔍 DEFINITIVE CHECK - Starting course completion check:', {
      hasPodcast: !!podcast,
      hasUserProgress: !!userProgress,
      hasShownBefore: hasShownCompletionRef.current,
      isCurrentlyChecking: isCheckingRef.current,
      podcastId: podcast?.id
    });

    // Prevent multiple simultaneous checks
    if (isCheckingRef.current) {
      console.log('⏸️ ALREADY CHECKING - Skipping to prevent race condition');
      return;
    }

    if (!podcast || !userProgress || hasShownCompletionRef.current) {
      console.log('⏹️ DEFINITIVE SKIP - Completion check skipped:', {
        noPodcast: !podcast,
        noUserProgress: !userProgress,
        alreadyShown: hasShownCompletionRef.current
      });
      return;
    }

    isCheckingRef.current = true;

    try {
      const courseProgress = userProgress.find(p => p.course_id === podcast.id);
      
      console.log('📊 DEFINITIVE PROGRESS - Course progress analysis:', {
        courseId: podcast.id,
        progressData: courseProgress,
        isCompleted: courseProgress?.is_completed,
        progressPercentage: courseProgress?.progress_percentage,
        previousProgress: previousProgressRef.current
      });
      
      // Check if course just became 100% complete
      if (courseProgress?.is_completed && courseProgress?.progress_percentage === 100) {
        // Only show if we haven't shown it before and this is a new completion
        if (previousProgressRef.current < 100) {
          console.log('🎉 DEFINITIVE COMPLETION - Course just completed! Showing congratulations modal');
          
          // Get course stats using stable ref
          const stats = await getCourseStatsRef.current(podcast.id);
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
            console.log('✅ DEFINITIVE MODAL SHOWN - Completion modal displayed, hasShownCompletionRef set to true PERMANENTLY');
          }
        } else {
          console.log('🔄 DEFINITIVE ALREADY COMPLETE - Course was already at 100%, not showing modal again');
        }
      }
      
      // Update previous progress
      if (courseProgress?.progress_percentage !== undefined) {
        previousProgressRef.current = courseProgress.progress_percentage;
      }
    } finally {
      isCheckingRef.current = false;
    }
  }, [podcast, userProgress]); // ONLY stable dependencies

  // DEFINITIVE: Effect with minimal, stable dependencies
  useEffect(() => {
    console.log('🔄 DEFINITIVE EFFECT - useEffect triggered for course completion check');
    checkCourseCompletion();
  }, [checkCourseCompletion]); // Only depend on the stabilized callback

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
    console.log('📝 DEFINITIVE SUMMARY - Opening summary modal, closing completion modal');
    setShowCompletionModal(false);
    setShowSummaryModal(true);
  }, []);

  // Handle closing completion modal DEFINITIVELY
  const handleCloseCompletionModal = useCallback(() => {
    console.log('❌ DEFINITIVE CLOSE - PERMANENTLY CLOSING completion modal - will NEVER reopen');
    setShowCompletionModal(false);
    hasShownCompletionRef.current = true;
    console.log('🔒 DEFINITIVE LOCK - hasShownCompletionRef set to true PERMANENTLY - modal is LOCKED CLOSED');
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
