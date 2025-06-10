
import { useCallback, useState } from 'react';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useCoursePurchases } from '@/hooks/useCoursePurchases';
import { Podcast, Lesson } from '@/types';

interface UseCourseActionsProps {
  podcast: Podcast | null;
  isPremium: boolean;
  hasAccess: boolean;
  handleSelectLesson: (lesson: Lesson, isManual?: boolean) => void;
}

export function useCourseActions({
  podcast,
  isPremium,
  hasAccess,
  handleSelectLesson
}: UseCourseActionsProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const { toggleSaveCourse, startCourse, refetch } = useUserProgress();
  const { refetch: refetchPurchases } = useCoursePurchases();

  const handleStartLearning = useCallback(async () => {
    if (!podcast) return;

    if (isPremium && !hasAccess) {
      setShowCheckout(true);
      return;
    }

    await startCourse(podcast.id);
    await refetch();
    
    // Scroll to the learning path section
    const learningPathElement = document.getElementById('learning-path-section');
    if (learningPathElement) {
      learningPathElement.scrollIntoView({ behavior: 'smooth' });
    }
    console.log('Started learning course:', podcast.title);
  }, [podcast, isPremium, hasAccess, startCourse, refetch]);

  const handleToggleSave = useCallback(() => {
    if (podcast) {
      toggleSaveCourse(podcast.id);
    }
  }, [podcast, toggleSaveCourse]);

  const handleLessonSelect = useCallback((lesson: Lesson) => {
    // Check if user has access to this lesson
    if (isPremium && !hasAccess) {
      setShowCheckout(true);
      return;
    }
    
    // Use manual selection flag to prevent auto-play interference
    handleSelectLesson(lesson, true);
  }, [isPremium, hasAccess, handleSelectLesson]);

  const handlePurchaseComplete = useCallback(() => {
    refetchPurchases();
  }, [refetchPurchases]);

  return {
    showCheckout,
    setShowCheckout,
    handleStartLearning,
    handleToggleSave,
    handleLessonSelect,
    handlePurchaseComplete
  };
}
