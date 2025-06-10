
import { useCallback } from 'react';
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
  
  const handleLessonComplete = useCallback(async () => {
    if (!currentLesson || !podcast || !user) {
      console.log('❌ Cannot complete lesson: missing dependencies');
      return;
    }

    console.log('🏁 LESSON COMPLETE:', currentLesson.title);
    
    try {
      // 1. OPTIMISTIC UPDATE: Actualizar estado local inmediatamente
      const nextLesson = getNextLesson(currentLesson, podcast.lessons, podcast.modules);
      
      const updatedLessons = podcast.lessons.map(lesson => {
        if (lesson.id === currentLesson.id) {
          // Marcar lección actual como completada
          return { ...lesson, isCompleted: true };
        }
        if (nextLesson && lesson.id === nextLesson.id) {
          // Desbloquear siguiente lección inmediatamente
          return { ...lesson, isLocked: false };
        }
        return lesson;
      });
      
      // Actualizar podcast con cambios optimistas
      const updatedPodcast = { ...podcast, lessons: updatedLessons };
      setPodcast(updatedPodcast);
      
      console.log('✅ Optimistic update applied - UI should be updated immediately');
      
      // 2. BACKGROUND: Actualizar base de datos sin bloquear UI
      const dbUpdates = Promise.all([
        markLessonCompleteInDB(currentLesson.id, podcast.id),
        updateLessonPosition(currentLesson.id, podcast.id, 100)
      ]);
      
      // 3. AUTO-ADVANCE: Transición más rápida y suave
      if (isAutoAdvanceAllowed && nextLesson) {
        console.log('⏭️ Auto-advancing to next lesson (optimized):', nextLesson.title);
        
        // Transición más rápida (300ms en lugar de 1000ms)
        setTimeout(() => {
          const updatedNextLesson = {
            ...nextLesson,
            isLocked: false // Asegurar que está desbloqueada
          };
          setCurrentLesson(updatedNextLesson);
          setIsPlaying(true);
        }, 300);
      } else {
        console.log('⏹️ No auto-advance: reached end or not allowed');
        setIsPlaying(false);
      }
      
      // 4. BACKGROUND: Esperar actualizaciones de BD y refrescar datos solo una vez
      try {
        await dbUpdates;
        console.log('💾 Database updates completed');
        
        // SINGLE REFETCH: Solo un refetch después de que todo esté completo
        setTimeout(() => {
          refetchLessonProgress();
          refetchCourseProgress();
        }, 500);
        
      } catch (dbError) {
        console.error('❌ Database update failed:', dbError);
        // En caso de error, revertir cambios optimistas
        setPodcast(podcast);
      }
      
    } catch (error) {
      console.error('❌ Error completing lesson:', error);
      // Revertir cambios optimistas en caso de error
      setPodcast(podcast);
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
    refetchLessonProgress,
    refetchCourseProgress,
    isAutoAdvanceAllowed
  ]);

  return { handleLessonComplete };
}
