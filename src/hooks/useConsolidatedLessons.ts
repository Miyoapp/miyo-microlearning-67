
import { useEffect, useCallback, useRef } from 'react';
import { Podcast } from '@/types';
import { useUserLessonProgress } from './useUserLessonProgress';
import { useUserProgress } from './useUserProgress';
import { useAuth } from '@/components/auth/AuthProvider';
import { useLessonInitialization } from './consolidated-lessons/useLessonInitialization';
import { useCentralizedAudio } from './audio/useCentralizedAudio';

export function useConsolidatedLessons(podcast: Podcast | null, setPodcast: (podcast: Podcast) => void) {
  const { user } = useAuth();
  
  const { 
    lessonProgress, 
    markLessonComplete: markLessonCompleteInDB, 
    updateLessonPosition,
    refetch: refetchLessonProgress
  } = useUserLessonProgress();
  
  const { 
    userProgress,
    refetch: refetchCourseProgress,
    updateCourseProgress
  } = useUserProgress();

  // Control initialization
  const hasAutoInitialized = useRef(false);
  const hasUserMadeSelection = useRef(false);
  const hasAutoPositioned = useRef(false);

  // Use lesson initialization hook
  const {
    currentLesson,
    setCurrentLesson,
    initializePodcastWithProgress,
    initializeCurrentLesson
  } = useLessonInitialization(podcast, lessonProgress, userProgress, user, setPodcast);

  // Handle lesson completion
  const handleLessonComplete = useCallback(() => {
    if (!currentLesson || !podcast || !user) return;
    
    console.log('🏆 Handling lesson complete for:', currentLesson.title);
    
    // Mark as complete in database
    markLessonCompleteInDB(currentLesson.id, podcast.id);
    
    // Update local podcast state
    const updatedLessons = podcast.lessons.map(lesson => 
      lesson.id === currentLesson.id 
        ? { ...lesson, isCompleted: true }
        : lesson
    );
    setPodcast({ ...podcast, lessons: updatedLessons });
    
    // Update lesson position to 100%
    updateLessonPosition(currentLesson.id, podcast.id, currentLesson.duracion || 0);
    
    // Refetch progress data
    refetchLessonProgress();
    refetchCourseProgress();
    
    // Auto-advance to next lesson
    const currentIndex = podcast.lessons.findIndex(l => l.id === currentLesson.id);
    const nextLesson = podcast.lessons[currentIndex + 1];
    
    if (nextLesson && !nextLesson.isLocked) {
      console.log('🚀 Auto-advancing to next lesson:', nextLesson.title);
      setCurrentLesson(nextLesson);
      updateLessonPosition(nextLesson.id, podcast.id, 1);
    } else {
      console.log('📚 Course completed - no more lessons');
      // Update course progress if all lessons completed
      const allCompleted = updatedLessons.every(lesson => lesson.isCompleted);
      if (allCompleted) {
        updateCourseProgress(podcast.id, { progress_percentage: 100 });
      }
    }
  }, [
    currentLesson,
    podcast,
    user,
    setPodcast,
    setCurrentLesson,
    markLessonCompleteInDB,
    updateLessonPosition,
    refetchLessonProgress,
    refetchCourseProgress,
    updateCourseProgress
  ]);

  // Progress update handler
  const handleProgressUpdate = useCallback((position: number) => {
    if (!currentLesson || !podcast || !user) return;
    
    // Only update for significant progress
    if (position > 5) {
      console.log('📊 Updating progress for:', currentLesson.title, position.toFixed(1) + 's');
      updateLessonPosition(currentLesson.id, podcast.id, position);
    }
  }, [currentLesson, podcast, user, updateLessonPosition]);

  // Centralized audio hook
  const centralizedAudio = useCentralizedAudio({
    currentLesson,
    podcast,
    user,
    onProgressUpdate: handleProgressUpdate,
    onLessonComplete: handleLessonComplete
  });

  // Lesson selection handler
  const handleSelectLesson = useCallback((lesson: any, shouldAutoPlay = false) => {
    console.log('🎯 Selecting lesson:', {
      lessonTitle: lesson.title,
      shouldAutoPlay,
      currentLessonId: currentLesson?.id,
      isSameLesson: currentLesson?.id === lesson.id
    });
    
    hasUserMadeSelection.current = true;
    
    const isSameLesson = currentLesson?.id === lesson.id;
    
    if (isSameLesson) {
      // Same lesson: toggle play/pause
      console.log('🔄 Same lesson - toggling playback');
      centralizedAudio.togglePlayPause();
      return;
    }
    
    // Different lesson: change lesson and optionally start playing
    console.log('🔀 Different lesson - changing and setting play state');
    setCurrentLesson(lesson);
    
    // Start playing after lesson change if requested
    if (shouldAutoPlay) {
      // Use setTimeout to ensure lesson change is processed first
      setTimeout(() => {
        centralizedAudio.play();
      }, 100);
    }
    
  }, [
    currentLesson?.id, 
    setCurrentLesson, 
    centralizedAudio
  ]);

  // Handle play/pause toggle for external controls
  const handleTogglePlay = useCallback(() => {
    console.log('🎵 Toggling play/pause from external control');
    centralizedAudio.togglePlayPause();
  }, [centralizedAudio]);

  // Initialize podcast when data is available
  useEffect(() => {
    console.log('🔄 Podcast initialization effect', {
      hasPodcast: !!podcast,
      hasUser: !!user,
      lessonProgressDefined: lessonProgress !== undefined,
      userProgressDefined: userProgress !== undefined,
      hasAutoInitialized: hasAutoInitialized.current
    });

    if (podcast && user && lessonProgress !== undefined && userProgress !== undefined && !hasAutoInitialized.current) {
      console.log('📊 Initializing podcast with progress...');
      initializePodcastWithProgress();
      hasAutoInitialized.current = true;
    }
  }, [podcast?.id, user?.id, lessonProgress, userProgress, initializePodcastWithProgress]);

  // Auto-position on current lesson
  useEffect(() => {
    console.log('🎯 Current lesson auto-positioning effect', {
      hasPodcast: !!podcast,
      hasLessons: podcast?.lessons?.length > 0,
      hasUser: !!user,
      currentLessonExists: !!currentLesson,
      hasAutoInitialized: hasAutoInitialized.current,
      hasUserMadeSelection: hasUserMadeSelection.current,
      hasAutoPositioned: hasAutoPositioned.current
    });

    if (
      podcast && 
      podcast.lessons && 
      podcast.lessons.length > 0 && 
      user && 
      !currentLesson && 
      hasAutoInitialized.current && 
      !hasUserMadeSelection.current &&
      !hasAutoPositioned.current
    ) {
      console.log('🎯 Auto-positioning on next lesson...');
      initializeCurrentLesson();
      hasAutoPositioned.current = true;
    }
  }, [
    podcast?.id,
    podcast?.lessons?.length,
    user?.id,
    currentLesson?.id,
    hasAutoInitialized.current,
    initializeCurrentLesson
  ]);

  return {
    // Lesson state
    currentLesson,
    setCurrentLesson,
    
    // Audio state and controls
    isPlaying: centralizedAudio.isPlaying,
    audioState: centralizedAudio,
    
    // Handlers
    handleSelectLesson,
    handleTogglePlay,
    handleLessonComplete,
    handleProgressUpdate,
    initializeCurrentLesson,
    initializePodcastWithProgress
  };
}
