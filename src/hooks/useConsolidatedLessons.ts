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

  // SIMPLIFIED: Single initialization state
  const hasInitialized = useRef(false);

  // Use specialized hook for initialization
  const {
    currentLesson,
    setCurrentLesson,
    initializePodcastWithProgress,
    initializeCurrentLesson
  } = useLessonInitialization(podcast, lessonProgress, userProgress, user, setPodcast);

  // POST-REFACTOR DEBUG: Verificar inicialización del hook
  console.log('🔍 POST-REFACTOR DEBUG - useConsolidatedLessons:', {
    podcastId: podcast?.id,
    userId: user?.id,
    currentLessonId: currentLesson?.id,
    hasInitialized: hasInitialized.current,
    lessonProgressCount: lessonProgress?.length || 0,
    userProgressCount: userProgress?.length || 0,
    audioPlayerInitialized: !!(podcast?.lessons?.length)
  });

  // Initialize audio player with lessons
  const audioPlayer = useAudioPlayer({
    lessons: podcast?.lessons || [],
    onLessonComplete: (lessonId: string) => {
      console.log('🎯 Audio player lesson complete:', lessonId);
      if (audioPlayer.currentLessonId === lessonId) {
        handleLessonComplete();
      }
    },
    onProgressUpdate: (lessonId: string, position: number) => {
      console.log('📊 Audio player progress update:', lessonId, position);
      if (audioPlayer.currentLessonId === lessonId) {
        handleProgressUpdate(position);
      }
    }
  });

  // POST-REFACTOR DEBUG: Verificar estado del audio player
  console.log('🎵 POST-REFACTOR DEBUG - Audio Player State:', {
    currentLessonId: audioPlayer.currentLessonId,
    isPlaying: audioPlayer.isPlaying,
    isReady: audioPlayer.isReady,
    error: audioPlayer.error,
    lessonsAvailable: podcast?.lessons?.length || 0
  });

  // Lesson completion handler
  const handleLessonComplete = useCallback(() => {
    const activeLessonId = audioPlayer.currentLessonId;
    if (!activeLessonId || !podcast || !user) return;
    
    const activeLesson = podcast.lessons.find(l => l.id === activeLessonId);
    if (!activeLesson) return;
    
    console.log('🎯 Consolidated Lessons - Handling lesson complete:', activeLesson.title);
    
    // Mark as complete in database
    markLessonCompleteInDB(activeLesson.id, podcast.id);
    
    // Update local podcast state
    const updatedLessons = podcast.lessons.map(lesson => 
      lesson.id === activeLesson.id 
        ? { ...lesson, isCompleted: true }
        : lesson
    );
    setPodcast({ ...podcast, lessons: updatedLessons });
    
    // Update lesson position to 100%
    updateLessonPosition(activeLesson.id, podcast.id, activeLesson.duracion || 0);
    
    // Refetch progress data
    refetchLessonProgress();
    refetchCourseProgress();
    
    // Auto-advance logic
    const currentIndex = podcast.lessons.findIndex(l => l.id === activeLesson.id);
    const nextLesson = podcast.lessons[currentIndex + 1];
    
    if (nextLesson) {
      console.log('🔄 Auto-advancing to next lesson:', nextLesson.title);
      setCurrentLesson(nextLesson);
      updateLessonPosition(nextLesson.id, podcast.id, 1);
    } else {
      console.log('✅ Course completed - no more lessons');
      const allCompleted = updatedLessons.every(lesson => lesson.isCompleted);
      if (allCompleted) {
        updateCourseProgress(podcast.id, { progress_percentage: 100 });
      }
    }
  }, [
    audioPlayer.currentLessonId,
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
    const activeLessonId = audioPlayer.currentLessonId;
    if (!activeLessonId || !podcast || !user) return;
    
    console.log('📊 Consolidated Lessons - Progress update:', {
      lessonId: activeLessonId,
      position,
      timestamp: new Date().toLocaleTimeString()
    });
    
    updateLessonPosition(activeLessonId, podcast.id, position);
  }, [audioPlayer.currentLessonId, podcast, user, updateLessonPosition]);

  // SIMPLIFIED: Lesson selection handler
  const handleSelectLesson = useCallback((lesson: any, shouldAutoPlay = false) => {
    console.log('🎯 Consolidated Lessons - handleSelectLesson:', {
      lessonTitle: lesson.title,
      shouldAutoPlay,
      audioCurrentLessonId: audioPlayer.currentLessonId,
      timestamp: new Date().toLocaleTimeString()
    });
    
    // Validation
    if (!lesson?.id) {
      console.error('❌ Invalid lesson data:', lesson);
      return;
    }
    
    // Set the new current lesson
    setCurrentLesson(lesson);
    
    // Handle audio playback if requested
    if (shouldAutoPlay) {
      audioPlayer.play(lesson);
    }
    
    console.log('✅ Consolidated Lessons - Lesson selection complete:', lesson.title);
    
  }, [
    audioPlayer.currentLessonId, 
    setCurrentLesson,
    audioPlayer.play
  ]);

  // Toggle play/pause handler
  const handleTogglePlay = useCallback(() => {
    if (!currentLesson) return;
    
    if (audioPlayer.isPlaying) {
      audioPlayer.pause();
    } else {
      audioPlayer.play(currentLesson);
    }
  }, [currentLesson, audioPlayer.isPlaying, audioPlayer.play, audioPlayer.pause]);

  // SIMPLIFIED: Single initialization effect
  useEffect(() => {
    // Only initialize once when all data is available
    if (
      podcast && 
      user && 
      lessonProgress !== undefined && 
      userProgress !== undefined && 
      !hasInitialized.current
    ) {
      console.log('📊 POST-REFACTOR: Initializing podcast with progress...', {
        podcastId: podcast.id,
        userId: user.id,
        lessonProgressLength: lessonProgress.length,
        userProgressLength: userProgress.length
      });
      
      try {
        initializePodcastWithProgress();
        
        // Auto-position current lesson if no lesson selected
        if (!currentLesson) {
          setTimeout(() => {
            console.log('📊 POST-REFACTOR: Auto-positioning current lesson...');
            initializeCurrentLesson();
          }, 100); // Small delay to ensure state is set
        }
        
        hasInitialized.current = true;
        console.log('✅ POST-REFACTOR: Initialization completed successfully');
      } catch (error) {
        console.error('❌ POST-REFACTOR: Error initializing podcast:', error);
      }
    } else {
      console.log('⏳ POST-REFACTOR: Waiting for initialization conditions:', {
        hasPodcast: !!podcast,
        hasUser: !!user,
        lessonProgressReady: lessonProgress !== undefined,
        userProgressReady: userProgress !== undefined,
        alreadyInitialized: hasInitialized.current
      });
    }
  }, [
    podcast?.id, 
    user?.id, 
    lessonProgress !== undefined,
    userProgress !== undefined,
    currentLesson?.id,
    initializePodcastWithProgress,
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
    handleTogglePlay,
    // Expose all audio player functionality with unified naming (audio prefix)
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
