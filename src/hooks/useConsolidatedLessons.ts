
import { useEffect } from 'react';
import { Podcast } from '@/types';
import { useUserLessonProgress } from './useUserLessonProgress';
import { useUserProgress } from './useUserProgress';
import { useAuth } from '@/components/auth/AuthProvider';
import { useLessonInitialization } from './consolidated-lessons/useLessonInitialization';
import { useLessonPlayback } from './consolidated-lessons/useLessonPlayback';
import { useLessonCompletion } from './consolidated-lessons/useLessonCompletion';
import { isCourseCompleted } from './consolidated-lessons/lessonProgressUtils';

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
    updateCourseProgress, 
    refetch: refetchCourseProgress 
  } = useUserProgress();

  // Use specialized hooks
  const {
    currentLesson,
    setCurrentLesson,
    initializePodcastWithProgress,
    initializeCurrentLesson
  } = useLessonInitialization(podcast, lessonProgress, userProgress, user, setPodcast);

  const {
    isPlaying,
    setIsPlaying,
    handleSelectLesson: handleSelectLessonFromPlayback,
    handleTogglePlay,
    handleProgressUpdate
  } = useLessonPlayback(podcast, currentLesson, userProgress, user, updateLessonPosition);

  const {
    handleLessonComplete
  } = useLessonCompletion(
    currentLesson,
    podcast,
    user,
    setPodcast,
    setCurrentLesson,
    setIsPlaying,
    markLessonCompleteInDB,
    updateLessonPosition,
    refetchLessonProgress,
    refetchCourseProgress
  );

  // Enhanced lesson selection that updates current lesson and handles playback
  const handleSelectLesson = (lesson: any) => {
    console.log('🎯 handleSelectLesson called with:', lesson.title, 'isCompleted:', lesson.isCompleted, 'isLocked:', lesson.isLocked);
    
    // CORRECCIÓN FINAL: Lógica clara y consistente
    // Lecciones completadas SIEMPRE pueden ser reproducidas, sin importar el estado del curso
    const canSelectLesson = lesson.isCompleted || !lesson.isLocked;
    
    if (!canSelectLesson) {
      console.log('⚠️ Lesson is locked and not completed, cannot select');
      return;
    }
    
    console.log('✅ Lesson can be selected, updating current lesson and starting playback');
    
    // Update current lesson and handle playback
    setCurrentLesson(lesson);
    handleSelectLessonFromPlayback(lesson);
  };

  // Initialize when podcast or lesson progress changes
  useEffect(() => {
    if (podcast && lessonProgress.length >= 0) { // >= 0 to handle empty arrays
      console.log('📊 Initializing podcast with progress data...');
      initializePodcastWithProgress();
    }
  }, [podcast?.id, lessonProgress, userProgress, initializePodcastWithProgress]);

  // Initialize current lesson when podcast is ready
  useEffect(() => {
    if (podcast && podcast.lessons.length > 0) {
      console.log('🎯 Initializing current lesson...');
      initializeCurrentLesson();
    }
  }, [podcast?.lessons, userProgress, initializeCurrentLesson]);

  // MEJORA CRÍTICA: Actualizaciones en tiempo real más agresivas y eficientes
  useEffect(() => {
    if (podcast && lessonProgress.length >= 0) {
      console.log('⚡ Lesson progress updated, triggering IMMEDIATE UI refresh for real-time updates');
      
      // Refresh inmediato sin timeout para actualizaciones instantáneas
      initializePodcastWithProgress();
    }
  }, [lessonProgress, initializePodcastWithProgress]);

  // MEJORA CRÍTICA: Actualizaciones inmediatas para progreso de curso
  useEffect(() => {
    if (podcast && userProgress.length >= 0) {
      console.log('⚡ User course progress updated, triggering IMMEDIATE UI refresh for real-time updates');
      
      // Refresh inmediato sin timeout para actualizaciones instantáneas
      initializePodcastWithProgress();
    }
  }, [userProgress, initializePodcastWithProgress]);

  return {
    currentLesson,
    setCurrentLesson,
    isPlaying,
    setIsPlaying,
    initializeCurrentLesson,
    handleSelectLesson,
    handleTogglePlay,
    handleLessonComplete,
    handleProgressUpdate,
    initializePodcastWithProgress
  };
}
