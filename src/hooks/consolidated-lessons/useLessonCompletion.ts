
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
      // 1. Marcar lección como completada en BD
      await markLessonCompleteInDB(currentLesson.id, podcast.id);
      
      // 2. Actualizar posición a 100%
      await updateLessonPosition(currentLesson.id, podcast.id, 100);
      
      // 3. Actualizar estado local inmediatamente
      const updatedLessons = podcast.lessons.map(lesson => 
        lesson.id === currentLesson.id 
          ? { ...lesson, isCompleted: true }
          : lesson
      );
      
      // 4. CORREGIDO: Desbloquear siguiente lección usando orden real
      const nextLesson = getNextLesson(currentLesson, podcast.lessons, podcast.modules);
      
      if (nextLesson) {
        // Encontrar y desbloquear la siguiente lección
        const nextLessonIndex = updatedLessons.findIndex(l => l.id === nextLesson.id);
        if (nextLessonIndex !== -1) {
          updatedLessons[nextLessonIndex] = {
            ...updatedLessons[nextLessonIndex],
            isLocked: false
          };
          
          console.log('🔓 Unlocked next lesson (real sequence):', updatedLessons[nextLessonIndex].title);
        }
      }
      
      // 5. Actualizar estado del podcast
      const updatedPodcast = { ...podcast, lessons: updatedLessons };
      setPodcast(updatedPodcast);
      
      // 6. CORREGIDO: Auto-avance usando orden real
      if (isAutoAdvanceAllowed && nextLesson) {
        console.log('⏭️ Auto-advancing to next lesson (real sequence):', nextLesson.title);
        
        // Pequeña pausa para transición suave
        setTimeout(() => {
          setCurrentLesson(nextLesson);
          setIsPlaying(true);
        }, 1000);
      } else {
        console.log('⏹️ No auto-advance: reached end or not allowed');
        setIsPlaying(false);
      }
      
      // 7. Refrescar datos de progreso
      setTimeout(() => {
        refetchLessonProgress();
        refetchCourseProgress();
      }, 500);
      
    } catch (error) {
      console.error('❌ Error completing lesson:', error);
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
