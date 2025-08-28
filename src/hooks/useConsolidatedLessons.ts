
import { useEffect, useCallback, useRef } from 'react';
import { Podcast } from '@/types';
import { useUserLessonProgress } from './useUserLessonProgress';
import { useUserProgress } from './useUserProgress';
import { useAuth } from '@/components/auth/AuthProvider';
import { useLessonInitialization } from './consolidated-lessons/useLessonInitialization';
import { useAudioPlayer } from './useAudioPlayer';
import React from 'react';

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

  // Control más granular de la inicialización
  const hasAutoInitialized = useRef(false);
  const hasUserMadeSelection = useRef(false);
  const hasAutoPositioned = useRef(false);

  // Usar hook especializado solo para inicialización
  const {
    currentLesson,
    setCurrentLesson,
    initializePodcastWithProgress,
    initializeCurrentLesson
  } = useLessonInitialization(podcast, lessonProgress, userProgress, user, setPodcast);

  // Initialize audio player with lessons
  const audioPlayer = useAudioPlayer({
    lessons: podcast?.lessons || [],
    onLessonComplete: (lessonId: string) => {
      console.log('🎯 Audio player lesson complete:', lessonId);
      if (currentLesson?.id === lessonId) {
        handleLessonComplete();
      }
    },
    onProgressUpdate: (lessonId: string, position: number) => {
      console.log('📊 Audio player progress update:', lessonId, position);
      if (currentLesson?.id === lessonId) {
        handleProgressUpdate(position);
      }
    }
  });

  // Auto-advance allowed logic
  const isAutoAdvanceAllowed = React.useMemo(() => {
    if (!user || !podcast) return false;
    return true;
  }, [user, podcast]);

  // Lesson completion handler
  const handleLessonComplete = useCallback(() => {
    if (!currentLesson || !podcast || !user) return;
    
    console.log('🎯 Consolidated Lessons - Handling lesson complete:', currentLesson.title);
    
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
    
    // Auto-advance logic
    if (isAutoAdvanceAllowed) {
      const currentIndex = podcast.lessons.findIndex(l => l.id === currentLesson.id);
      const nextLesson = podcast.lessons[currentIndex + 1];
      
      if (nextLesson) {
        console.log('🔄 Auto-advancing to next lesson:', nextLesson.title);
        setCurrentLesson(nextLesson);
        updateLessonPosition(nextLesson.id, podcast.id, 1);
      } else {
        console.log('✅ Course completed - no more lessons');
        // Update course progress if all lessons completed
        const allCompleted = updatedLessons.every(lesson => lesson.isCompleted);
        if (allCompleted) {
          updateCourseProgress(podcast.id, { progress_percentage: 100 });
        }
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
    isAutoAdvanceAllowed,
    updateCourseProgress
  ]);

  // Progress update handler
  const handleProgressUpdate = useCallback((position: number) => {
    if (!currentLesson || !podcast || !user) return;
    
    console.log('📊 Consolidated Lessons - Progress update:', {
      lessonId: currentLesson.id,
      position,
      timestamp: new Date().toLocaleTimeString()
    });
    
    updateLessonPosition(currentLesson.id, podcast.id, position);
  }, [currentLesson, podcast, user, updateLessonPosition]);

  // Lesson selection handler
  const handleSelectLesson = useCallback((lesson: any, shouldAutoPlay = false) => {
    console.log('🎯 Consolidated Lessons - handleSelectLesson:', {
      lessonTitle: lesson.title,
      shouldAutoPlay,
      currentLessonId: currentLesson?.id,
      timestamp: new Date().toLocaleTimeString()
    });
    
    // Validación de datos
    if (!lesson || !lesson.id) {
      console.error('❌ Invalid lesson data:', lesson);
      return;
    }
    
    // Mark user selection
    hasUserMadeSelection.current = true;
    
    // Set the new current lesson
    setCurrentLesson(lesson);
    
    // Handle audio playback if requested
    if (shouldAutoPlay) {
      audioPlayer.play(lesson);
    }
    
    console.log('✅ Consolidated Lessons - Lesson selection complete:', lesson.title);
    
  }, [
    currentLesson?.id, 
    setCurrentLesson,
    audioPlayer
  ]);

  // Toggle play/pause handler
  const handleTogglePlay = useCallback(() => {
    if (!currentLesson) return;
    
    if (audioPlayer.isPlaying) {
      audioPlayer.pause();
    } else {
      audioPlayer.play(currentLesson);
    }
  }, [currentLesson, audioPlayer]);

  // Inicializar podcast cuando todos los datos estén disponibles
  useEffect(() => {
    console.log('🔄 Consolidated Lessons - PODCAST INITIALIZATION EFFECT');
    console.log('🔍 Conditions:', {
      hasPodcast: !!podcast,
      hasUser: !!user,
      lessonProgressDefined: lessonProgress !== undefined,
      userProgressDefined: userProgress !== undefined,
      hasAutoInitialized: hasAutoInitialized.current
    });

    if (podcast && user && lessonProgress !== undefined && userProgress !== undefined && !hasAutoInitialized.current) {
      console.log('📊 ALL DATA AVAILABLE - INITIALIZING PODCAST WITH PROGRESS...');
      try {
        initializePodcastWithProgress();
        hasAutoInitialized.current = true;
      } catch (error) {
        console.error('❌ Error initializing podcast:', error);
      }
    }
  }, [podcast?.id, user?.id, lessonProgress, userProgress, initializePodcastWithProgress]);

  // Auto-inicialización inteligente que respeta el progreso del curso
  useEffect(() => {
    console.log('🎯 Consolidated Lessons - CURRENT LESSON AUTO-POSITIONING EFFECT');
    console.log('🔍 Conditions:', {
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
      console.log('🎯 AUTO-POSITIONING on next lesson to continue...');
      try {
        initializeCurrentLesson();
        hasAutoPositioned.current = true;
      } catch (error) {
        console.error('❌ Error auto-positioning lesson:', error);
      }
    } else if (hasUserMadeSelection.current) {
      console.log('👤 User has made manual selection - skipping auto-initialization');
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
    currentLesson,
    setCurrentLesson,
    initializeCurrentLesson,
    handleSelectLesson,
    handleLessonComplete,
    handleProgressUpdate,
    initializePodcastWithProgress,
    // Audio player state and controls
    isPlaying: audioPlayer.isPlaying,
    handleTogglePlay,
    // Expose all audio player functionality
    audioCurrentLessonId: audioPlayer.currentLessonId,
    audioIsPlaying: audioPlayer.isPlaying,
    audioCurrentTime: audioPlayer.currentTime,
    audioDuration: audioPlayer.duration,
    audioIsReady: audioPlayer.isReady,
    audioError: audioPlayer.error,
    getDisplayProgress: audioPlayer.getDisplayProgress,
    onPlay: audioPlayer.play,
    onPause: audioPlayer.pause,
    onSeek: audioPlayer.seek,
    onSkipBackward: audioPlayer.skipBackward,
    onSkipForward: audioPlayer.skipForward,
    onSetPlaybackRate: audioPlayer.setPlaybackRate,
    onSetVolume: audioPlayer.setVolume,
    onSetMuted: audioPlayer.setMuted
  };
}
