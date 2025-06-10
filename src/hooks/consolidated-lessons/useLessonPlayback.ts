
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
  
  // CRITICAL: Flag to control action priority
  const manualSelectionActive = useRef(false);
  const autoAdvanceBlocked = useRef(false);

  // Handle lesson selection (ABSOLUTE MANUAL PRIORITY)
  const handleSelectLesson = useCallback((lesson: Lesson, isManualSelection = true) => {
    console.log('🎯 Selecting lesson:', lesson.title, 'isCompleted:', lesson.isCompleted, 'isLocked:', lesson.isLocked, 'isManual:', isManualSelection);

    // SIMPLIFIED LOGIC: Completed lessons can ALWAYS be played
    const canSelectLesson = lesson.isCompleted || !lesson.isLocked;

    if (!canSelectLesson) {
      console.log('⚠️ Lesson is locked and not completed, cannot select:', lesson.title);
      return;
    }

    // CRITICAL: Mark as manual selection to block auto-advance
    if (isManualSelection) {
      console.log('🚫 MANUAL SELECTION: Blocking auto-advance for 3 seconds');
      manualSelectionActive.current = true;
      autoAdvanceBlocked.current = true;
      
      // Unblock auto-advance after 3 seconds
      setTimeout(() => {
        manualSelectionActive.current = false;
        autoAdvanceBlocked.current = false;
        console.log('✅ Auto-advance unblocked after manual selection timeout');
      }, 3000);
    }

    console.log('✅ Lesson can be selected and played:', lesson.title);

    // If selecting the same lesson that's already playing, just toggle play/pause
    if (currentLesson && lesson.id === currentLesson.id && isPlaying) {
      setIsPlaying(false);
      return;
    }

    // OPTIMIZED: Use startTransition for better performance on play state
    startTransition(() => {
      setIsPlaying(true);
    });

    // Track lesson start in database (only for incomplete lessons)
    if (podcast && user && !lesson.isCompleted) {
      console.log('📊 Tracking lesson start for incomplete lesson:', lesson.title);
      updateLessonPosition(lesson.id, podcast.id, 1);
    } else if (lesson.isCompleted) {
      console.log('🔄 Replaying completed lesson, not tracking start:', lesson.title);
    }
  }, [currentLesson, isPlaying, podcast, user, updateLessonPosition]);

  // Toggle play/pause
  const handleTogglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Handle progress updates during playback (only for incomplete lessons)
  const handleProgressUpdate = useCallback((position: number) => {
    if (!currentLesson || !podcast || !user) return;
    
    // Never update progress for already completed lessons
    if (currentLesson.isCompleted) {
      console.log('📝 Lesson already completed, not updating progress:', currentLesson.title);
      return;
    }

    // Only update progress for incomplete lessons when position > 5%
    if (position > 5) {
      console.log('📈 Updating progress for incomplete lesson:', currentLesson.title, 'position:', position);
      updateLessonPosition(currentLesson.id, podcast.id, position);
    }
  }, [currentLesson, podcast, user, updateLessonPosition]);

  // NEW FUNCTION: Check if auto-advance is allowed
  const isAutoAdvanceAllowed = useCallback(() => {
    const allowed = !autoAdvanceBlocked.current && !manualSelectionActive.current;
    console.log('🤖 Auto-advance allowed:', allowed, 'manualActive:', manualSelectionActive.current, 'blocked:', autoAdvanceBlocked.current);
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
