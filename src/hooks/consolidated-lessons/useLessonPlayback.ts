
import { useState, useCallback, useRef } from 'react';
import { Lesson, Podcast } from '@/types';
import { UserCourseProgress } from '../useUserProgress';
import { startTransition } from 'react';

export function useLessonPlayback(
  podcast: Podcast | null,
  currentLesson: Lesson | null,
  userProgress: UserCourseProgress[],
  user: any,
  updateLessonPosition: (lessonId: string, courseId: string, position: number) => void
) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Control flags for manual vs automatic actions
  const manualSelectionActive = useRef(false);
  const autoAdvanceBlocked = useRef(false);

  // Handle lesson selection with immediate playback for manual selections
  const handleSelectLesson = useCallback((lesson: Lesson, isManualSelection = true) => {
    console.log('🎯 Selecting lesson:', lesson.title, 'isCompleted:', lesson.isCompleted, 'isLocked:', lesson.isLocked, 'isManual:', isManualSelection);

    // FIXED: Allow playback of completed lessons and first lesson
    const canSelectLesson = lesson.isCompleted || !lesson.isLocked || (podcast?.lessons[0]?.id === lesson.id);

    if (!canSelectLesson) {
      console.log('⚠️ Lesson is locked and not completed, cannot select:', lesson.title);
      return;
    }

    // Handle manual selection priority
    if (isManualSelection) {
      console.log('👤 MANUAL SELECTION: Blocking auto-advance temporarily and starting playback');
      manualSelectionActive.current = true;
      autoAdvanceBlocked.current = true;
      
      // Unblock auto-advance after 3 seconds
      setTimeout(() => {
        manualSelectionActive.current = false;
        autoAdvanceBlocked.current = false;
        console.log('✅ Auto-advance unblocked after manual selection');
      }, 3000);
    }

    console.log('✅ Lesson can be played:', lesson.title);

    // FIXED: For manual selections, always start playback immediately
    if (isManualSelection) {
      console.log('🎵 Starting immediate playback for manual selection');
      startTransition(() => {
        setIsPlaying(true);
      });
    } else {
      // For auto-selections, don't start playback automatically
      console.log('🔄 Auto-selection - not starting playback');
    }

    // Track start for incomplete lessons (not completed replays)
    if (podcast && user && !lesson.isCompleted) {
      console.log('📊 Tracking lesson start for incomplete lesson:', lesson.title);
      updateLessonPosition(lesson.id, podcast.id, 1);
    } else if (lesson.isCompleted) {
      console.log('🔄 Playing completed lesson - no progress tracking needed:', lesson.title);
    }
  }, [podcast, user, updateLessonPosition]);

  // Toggle play/pause
  const handleTogglePlay = useCallback(() => {
    console.log('🎵 Toggling play state from:', isPlaying, 'to:', !isPlaying);
    setIsPlaying(prev => !prev);
  }, [isPlaying]);

  // Handle progress updates - FIXED to respect completed lessons
  const handleProgressUpdate = useCallback((position: number) => {
    if (!currentLesson || !podcast || !user) return;
    
    // CRITICAL FIX: Never update progress for completed lessons during replay
    if (currentLesson.isCompleted) {
      console.log('🔄 Playing completed lesson - not updating progress:', currentLesson.title);
      return;
    }

    // Only update progress for incomplete lessons when position > 5%
    if (position > 5) {
      console.log('📈 Updating progress for incomplete lesson:', currentLesson.title, 'position:', position.toFixed(1) + '%');
      updateLessonPosition(currentLesson.id, podcast.id, position);
    }
  }, [currentLesson, podcast, user, updateLessonPosition]);

  // Check if auto-advance is allowed
  const isAutoAdvanceAllowed = useCallback(() => {
    const allowed = !autoAdvanceBlocked.current && !manualSelectionActive.current;
    console.log('🤖 Auto-advance check:', { allowed, manualActive: manualSelectionActive.current, blocked: autoAdvanceBlocked.current });
    return allowed;
  }, []);

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
