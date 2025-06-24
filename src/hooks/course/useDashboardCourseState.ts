
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCourseDataSimplified } from '@/hooks/useCourseDataSimplified';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useConsolidatedLessons } from '@/hooks/useConsolidatedLessons';

export function useDashboardCourseState() {
  const { courseId } = useParams<{ courseId: string }>();
  const [showCheckout, setShowCheckout] = useState(false);
  
  console.log(`🎭 [useDashboardCourseState] RENDER - courseId: ${courseId}`);
  
  // Hook simplificado que maneja todo con mejor debugging
  const { 
    podcast, 
    setPodcast, 
    isLoading, 
    isPremium, 
    hasAccess, 
    refetchPurchases,
    errorState,
    loadingState
  } = useCourseDataSimplified(courseId);
  
  const { userProgress, toggleSaveCourse, startCourse, refetch: refetchUserProgress } = useUserProgress();
  
  console.log(`🎭 [useDashboardCourseState] State:`, {
    courseId,
    isLoading,
    hasErrors: !!(errorState.course || errorState.purchases),
    podcast: !!podcast,
    courseTitle: podcast?.title,
    isPremium,
    hasAccess
  });

  // Use consolidated lessons hook - pero solo después de tener el curso
  const { 
    currentLesson, 
    isPlaying, 
    initializeCurrentLesson,
    handleSelectLesson, 
    handleTogglePlay, 
    handleLessonComplete,
    handleProgressUpdate,
    initializePodcastWithProgress
  } = useConsolidatedLessons(podcast, setPodcast);
  
  // Calculate course progress
  const courseProgress = userProgress.find(p => p.course_id === courseId);
  const isSaved = courseProgress?.is_saved || false;
  const hasStarted = (courseProgress?.progress_percentage || 0) > 0;
  const progressPercentage = courseProgress?.progress_percentage || 0;
  const isCompleted = courseProgress?.is_completed || false;
  const isReviewMode = isCompleted && progressPercentage === 100;

  return {
    courseId,
    podcast,
    currentLesson,
    isPlaying,
    isLoading,
    isPremium,
    hasAccess,
    errorState,
    loadingState,
    showCheckout,
    setShowCheckout,
    isSaved,
    hasStarted,
    progressPercentage,
    isCompleted,
    isReviewMode,
    // Action handlers
    handleSelectLesson,
    handleTogglePlay,
    handleLessonComplete,
    handleProgressUpdate,
    initializePodcastWithProgress,
    // Refetch functions
    refetchPurchases,
    refetchUserProgress,
    // User actions
    toggleSaveCourse,
    startCourse
  };
}
