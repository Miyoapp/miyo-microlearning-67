
import { useState, useCallback, useRef } from 'react';
import { Podcast, Lesson } from '@/types';
import { UserProgress } from '@/hooks/useUserProgress';
import { User } from '@supabase/supabase-js';

export function useLessonPlayback(
  podcast: Podcast | null,
  currentLesson: Lesson | null,
  userProgress: UserProgress[],
  user: User | null,
  updateLessonPosition: (lessonId: string, courseId: string, position: number) => Promise<void>
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoAdvanceAllowed, setIsAutoAdvanceAllowed] = useState(true);
  const manualSelectionActive = useRef(false);

  // Handle lesson selection with immediate playback for manual selections
  const handleSelectLesson = useCallback((lesson: Lesson, isManualSelection = false) => {
    console.log('🎵 handleSelectLesson:', lesson.title, 'manual:', isManualSelection);
    
    // Check if lesson is accessible
    if (lesson.isLocked && !lesson.isCompleted) {
      console.log('🚫 Lesson is locked and not completed');
      return;
    }
    
    // Set manual selection flag
    manualSelectionActive.current = isManualSelection;
    
    // Start playback immediately for manual selections
    if (isManualSelection) {
      console.log('▶️ Manual selection - starting playback immediately');
      setIsPlaying(true);
      setIsAutoAdvanceAllowed(true);
    } else {
      setIsPlaying(false);
      setIsAutoAdvanceAllowed(false);
    }
    
    // Track lesson start if not completed
    if (podcast && !lesson.isCompleted) {
      updateLessonPosition(lesson.id, podcast.id, 1);
    }
  }, [podcast, updateLessonPosition]);

  const handleTogglePlay = useCallback(() => {
    if (!currentLesson) return;
    
    console.log('🎵 Toggle play - current state:', isPlaying);
    setIsPlaying(!isPlaying);
    
    // Enable auto-advance when manually starting playback
    if (!isPlaying) {
      setIsAutoAdvanceAllowed(true);
    }
  }, [isPlaying, currentLesson]);

  // Handle progress updates during playback
  const handleProgressUpdate = useCallback((position: number) => {
    if (!currentLesson || !podcast || !user) return;
    
    // Only update progress for incomplete lessons during normal playback
    if (!currentLesson.isCompleted && position > 5) {
      console.log('📊 Updating progress for incomplete lesson:', currentLesson.title, position.toFixed(1) + '%');
      updateLessonPosition(currentLesson.id, podcast.id, position);
    }
  }, [currentLesson, podcast, user, updateLessonPosition]);

  return {
    isPlaying,
    setIsPlaying,
    handleSelectLesson,
    handleTogglePlay,
    handleProgressUpdate,
    isAutoAdvanceAllowed,
    manualSelectionActive: manualSelectionActive.current
  };
}
