
import { useState, useCallback, useRef } from 'react';
import { Lesson, Podcast } from '@/types';
import { useUserLessonProgress } from '@/hooks/useUserLessonProgress';

export function useStructuredLessons(podcast: Podcast | null) {
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const playingAudioRef = useRef<HTMLAudioElement | null>(null);
  const { markLessonComplete, updateLessonPosition } = useUserLessonProgress();

  const handlePlay = useCallback((lesson: Lesson) => {
    // Pause any currently playing audio
    if (playingAudioRef.current) {
      playingAudioRef.current.pause();
    }
    
    setCurrentLessonId(lesson.id);
    
    // Track lesson start
    if (podcast) {
      updateLessonPosition(lesson.id, podcast.id, 1);
    }
  }, [podcast, updateLessonPosition]);

  const handlePause = useCallback(() => {
    if (playingAudioRef.current) {
      playingAudioRef.current.pause();
    }
  }, []);

  const handleComplete = useCallback((lesson: Lesson) => {
    if (podcast) {
      markLessonComplete(lesson.id, podcast.id);
    }
    
    // Auto-advance to next lesson if available
    if (podcast) {
      const currentIndex = podcast.lessons.findIndex(l => l.id === lesson.id);
      const nextLesson = podcast.lessons[currentIndex + 1];
      
      if (nextLesson && !nextLesson.isLocked) {
        setTimeout(() => {
          handlePlay(nextLesson);
        }, 1000);
      } else {
        setCurrentLessonId(null);
      }
    }
  }, [podcast, markLessonComplete, handlePlay]);

  const handleProgressUpdate = useCallback((lesson: Lesson, progress: number) => {
    if (podcast && progress > 5) {
      updateLessonPosition(lesson.id, podcast.id, progress);
    }
  }, [podcast, updateLessonPosition]);

  return {
    currentLessonId,
    handlePlay,
    handlePause,
    handleComplete,
    handleProgressUpdate,
    setPlayingAudioRef: (ref: HTMLAudioElement | null) => {
      playingAudioRef.current = ref;
    }
  };
}
