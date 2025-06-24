
import { useCallback } from 'react';

interface UseDashboardCourseActionsProps {
  podcast: any;
  isPremium: boolean;
  hasAccess: boolean;
  startCourse: (courseId: string) => Promise<void>;
  refetchUserProgress: () => void;
  toggleSaveCourse: (courseId: string) => void;
  refetchPurchases: () => void;
  handleSelectLesson: (lesson: any, autoPlay?: boolean) => void;
  setShowCheckout: (show: boolean) => void;
}

export function useDashboardCourseActions({
  podcast,
  isPremium,
  hasAccess,
  startCourse,
  refetchUserProgress,
  toggleSaveCourse,
  refetchPurchases,
  handleSelectLesson,
  setShowCheckout
}: UseDashboardCourseActionsProps) {
  
  const handleStartLearning = useCallback(async () => {
    if (podcast) {
      if (isPremium && !hasAccess) {
        console.log('🔒 [DashboardCourse] Premium course without access - showing checkout');
        setShowCheckout(true);
        return;
      }

      await startCourse(podcast.id);
      await refetchUserProgress();
      
      // Scroll to the learning path section
      const learningPathElement = document.getElementById('learning-path-section');
      if (learningPathElement) {
        learningPathElement.scrollIntoView({ behavior: 'smooth' });
      }
      console.log('✅ [DashboardCourse] Started learning course:', podcast.title);
    }
  }, [podcast, isPremium, hasAccess, startCourse, refetchUserProgress, setShowCheckout]);

  const handleToggleSave = useCallback(() => {
    if (podcast) {
      toggleSaveCourse(podcast.id);
    }
  }, [podcast, toggleSaveCourse]);

  const handlePurchaseComplete = useCallback(() => {
    console.log('🎉 [DashboardCourse] Purchase completed, refetching purchases...');
    refetchPurchases();
  }, [refetchPurchases]);

  const handleLessonSelect = useCallback((lesson: any) => {
    // Check if user has access to this lesson
    if (isPremium && !hasAccess) {
      console.log('🔒 [DashboardCourse] Lesson access denied - showing checkout');
      setShowCheckout(true);
      return;
    }
    
    handleSelectLesson(lesson, true);
  }, [isPremium, hasAccess, handleSelectLesson, setShowCheckout]);

  const handleRetry = useCallback(() => {
    console.log('🔄 [DashboardCourse] Retrying course load...');
    window.location.reload();
  }, []);

  return {
    handleStartLearning,
    handleToggleSave,
    handlePurchaseComplete,
    handleLessonSelect,
    handleRetry
  };
}
