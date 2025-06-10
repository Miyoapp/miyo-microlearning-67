
import { useCallback, useRef } from 'react';
import { Lesson, Podcast } from '@/types';
import { User } from '@supabase/supabase-js';
import { getNextLesson } from './lessonOrderUtils';

export function useLessonCompletion(
  currentLesson: Lesson | null,
  podcast: Podcast | null,
  user: User | null,
  setPodcast: (podcast: Podcast) => void,
  setCurrentLesson: (lesson: Lesson) => void,
  setIsPlaying: (playing: boolean) => void,
  markLessonCompleteInDB: (lessonId: string, courseId: string) => Promise<void>,
  updateLessonPosition: (lessonId: string, courseId: string, position: number) => Promise<void>,
  refetchLessonProgress: () => void,
  refetchCourseProgress: () => void,
  isAutoAdvanceAllowed: boolean
) {
  
  const isCompletingRef = useRef(false); // NUEVO: Flag para evitar múltiples completions
  
  const handleLessonComplete = useCallback(async () => {
    if (!currentLesson || !podcast || !user) {
      console.log('❌ Cannot complete lesson: missing dependencies');
      return;
    }

    // CRÍTICO: Evitar múltiples ejecuciones simultáneas
    if (isCompletingRef.current) {
      console.log('🔄 Lesson completion already in progress, skipping...');
      return;
    }

    isCompletingRef.current = true;
    console.log('🏁 LESSON COMPLETE:', currentLesson.title);
    
    try {
      // 1. OPTIMISTIC UPDATE INMEDIATO: Sin delays
      const nextLesson = getNextLesson(currentLesson, podcast.lessons, podcast.modules);
      
      const updatedLessons = podcast.lessons.map(lesson => {
        if (lesson.id === currentLesson.id) {
          return { ...lesson, isCompleted: true };
        }
        if (nextLesson && lesson.id === nextLesson.id) {
          return { ...lesson, isLocked: false };
        }
        return lesson;
      });
      
      const updatedPodcast = { ...podcast, lessons: updatedLessons };
      setPodcast(updatedPodcast);
      
      console.log('✅ IMMEDIATE optimistic update applied');
      
      // 2. AUTO-ADVANCE INMEDIATO: Sin delays para transición más fluida
      if (isAutoAdvanceAllowed && nextLesson) {
        console.log('⏭️ IMMEDIATE auto-advance to:', nextLesson.title);
        
        const updatedNextLesson = {
          ...nextLesson,
          isLocked: false
        };
        setCurrentLesson(updatedNextLesson);
        setIsPlaying(true);
      } else {
        console.log('⏹️ No auto-advance: reached end or not allowed');
        setIsPlaying(false);
      }
      
      // 3. BACKGROUND DB UPDATES: Sin refetches para evitar conflictos
      const dbUpdates = Promise.all([
        markLessonCompleteInDB(currentLesson.id, podcast.id),
        updateLessonPosition(currentLesson.id, podcast.id, 100)
      ]);
      
      // Ejecutar en background sin afectar UI
      dbUpdates
        .then(() => {
          console.log('💾 Background DB updates completed successfully');
          // ELIMINADO: No más refetches automáticos para evitar conflictos
        })
        .catch(dbError => {
          console.error('❌ Background DB update failed:', dbError);
          // En caso de error, mantener el estado optimista
        })
        .finally(() => {
          // Reset completion flag después de un delay
          setTimeout(() => {
            isCompletingRef.current = false;
          }, 500);
        });
      
    } catch (error) {
      console.error('❌ Error completing lesson:', error);
      isCompletingRef.current = false;
    }
  }, [
    currentLesson,
    podcast,
    user,
    setPodcast,
    setCurrentLesson,
    setIsPlaying,
    markLessonCompleteInDB,
    updateLessonPosition,
    isAutoAdvanceAllowed
    // ELIMINADO: refetchLessonProgress, refetchCourseProgress para evitar re-renders
  ]);

  return { handleLessonComplete };
}
