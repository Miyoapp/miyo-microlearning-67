
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

  // SIMPLIFIED: Reduce complex state tracking
  const initializationState = useRef({
    hasAutoInitialized: false,
    hasUserSelection: false,
    hasAutoPositioned: false
  });

  // Use specialized hook for initialization
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

  // SIMPLIFIED: Auto-advance logic
  const isAutoAdvanceAllowed = React.useMemo(() => {
    return !!(user && podcast);
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

  // SIMPLIFIED: Lesson selection handler
  const handleSelectLesson = useCallback((lesson: any, shouldAutoPlay = false) => {
    console.log('🎯 Consolidated Lessons - handleSelectLesson:', {
      lessonTitle: lesson.title,
      shouldAutoPlay,
      currentLessonId: currentLesson?.id,
      timestamp: new Date().toLocaleTimeString()
    });
    
    // Validation
    if (!lesson?.id) {
      console.error('❌ Invalid lesson data:', lesson);
      return;
    }
    
    // Mark user selection to prevent auto-initialization conflicts
    initializationState.current.hasUserSelection = true;
    
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

  // SIMPLIFIED: Initialize podcast when data is available
  useEffect(() => {
    const canInitialize = (
      podcast && 
      user && 
      lessonProgress !== undefined && 
      userProgress !== undefined && 
      !initializationState.current.hasAutoInitialized
    );

    console.log('🔄 Consolidated Lessons - PODCAST INITIALIZATION EFFECT:', {
      canInitialize,
      hasPodcast: !!podcast,
      hasUser: !!user,
      lessonProgressDefined: lessonProgress !== undefined,
      userProgressDefined: userProgress !== undefined,
      hasAutoInitialized: initializationState.current.hasAutoInitialized
    });

    if (canInitialize) {
      console.log('📊 ALL DATA AVAILABLE - INITIALIZING PODCAST WITH PROGRESS...');
      try {
        initializePodcastWithProgress();
        initializationState.current.hasAutoInitialized = true;
      } catch (error) {
        console.error('❌ Error initializing podcast:', error);
      }
    }
  }, [
    // SIMPLIFIED: Use stable IDs only
    podcast?.id, 
    user?.id, 
    lessonProgress !== undefined ? 'defined' : 'undefined',
    userProgress !== undefined ? 'defined' : 'undefined',
    initializePodcastWithProgress
  ]);

  // SIMPLIFIED: Auto-position current lesson
  useEffect(() => {
    const canAutoPosition = (
      podcast?.lessons?.length > 0 &&
      user && 
      !currentLesson && 
      initializationState.current.hasAutoInitialized && 
      !initializationState.current.hasUserSelection &&
      !initializationState.current.hasAutoPositioned
    );

    console.log('🎯 Consolidated Lessons - CURRENT LESSON AUTO-POSITIONING EFFECT:', {
      canAutoPosition,
      hasLessons: podcast?.lessons?.length > 0,
      hasUser: !!user,
      currentLessonExists: !!currentLesson,
      hasAutoInitialized: initializationState.current.hasAutoInitialized,
      hasUserSelection: initializationState.current.hasUserSelection,
      hasAutoPositioned: initializationState.current.hasAutoPositioned
    });

    if (canAutoPosition) {
      console.log('🎯 AUTO-POSITIONING on next lesson to continue...');
      try {
        initializeCurrentLesson();
        initializationState.current.hasAutoPositioned = true;
      } catch (error) {
        console.error('❌ Error auto-positioning lesson:', error);
      }
    }
  }, [
    // SIMPLIFIED: Use minimal dependencies
    podcast?.lessons?.length,
    user?.id,
    currentLesson?.id,
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
    // UNIFIED AUDIO PLAYER STATE - single source of truth
    isPlaying: audioPlayer.isPlaying,
    handleTogglePlay,
    // Expose all audio player functionality with unified naming
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
