
import { useCallback } from 'react';
import { Lesson, Podcast } from '@/types';

export function useLessonCompletion(
  currentLesson: Lesson | null,
  podcast: Podcast | null,
  user: any,
  setPodcast: (podcast: Podcast) => void,
  setCurrentLesson: (lesson: Lesson) => void,
  setIsPlaying: (playing: boolean) => void,
  markLessonCompleteInDB: (lessonId: string, courseId: string) => Promise<void>,
  updateLessonPosition: (lessonId: string, courseId: string, position: number) => void,
  refetchLessonProgress: () => Promise<void>,
  refetchCourseProgress: () => Promise<void>
) {
  // Handle lesson completion
  const handleLessonComplete = useCallback(async () => {
    if (!currentLesson || !podcast || !user) return;

    console.log('🎯 Lesson completion triggered for:', currentLesson.title, 'isCompleted:', currentLesson.isCompleted);

    // LÓGICA UNIFICADA: Misma lógica de auto-advance para TODOS los cursos
    const findNextLesson = () => {
      const currentModule = podcast.modules.find(module => 
        module.lessonIds.includes(currentLesson.id)
      );
      
      if (!currentModule) return null;
      
      const currentLessonIndex = currentModule.lessonIds.indexOf(currentLesson.id);
      let nextLessonId: string | null = null;

      // Check if there's a next lesson in current module
      if (currentLessonIndex < currentModule.lessonIds.length - 1) {
        nextLessonId = currentModule.lessonIds[currentLessonIndex + 1];
      } else {
        // Check if there's a next module
        const currentModuleIndex = podcast.modules.indexOf(currentModule);
        if (currentModuleIndex < podcast.modules.length - 1) {
          const nextModule = podcast.modules[currentModuleIndex + 1];
          if (nextModule.lessonIds.length > 0) {
            nextLessonId = nextModule.lessonIds[0];
          }
        }
      }

      return nextLessonId ? podcast.lessons.find(l => l.id === nextLessonId) : null;
    };

    // Si la lección ya está completada, solo hacer auto-advance
    if (currentLesson.isCompleted) {
      console.log('🔄 Lesson already completed, advancing to next lesson for auto-play:', currentLesson.title);
      
      const nextLesson = findNextLesson();
      
      if (nextLesson) {
        // CORRECCIÓN: Verificar si la siguiente lección puede ser reproducida
        // (completada O desbloqueada)
        const canPlayNext = nextLesson.isCompleted || !nextLesson.isLocked;
        
        if (canPlayNext) {
          console.log('⏭️ Auto-advancing to next lesson:', nextLesson.title);
          setCurrentLesson(nextLesson);
          
          // Small delay to ensure state update, then auto-play
          setTimeout(() => {
            setIsPlaying(true);
            // Track next lesson start if it's not completed
            if (user && !nextLesson.isCompleted) {
              updateLessonPosition(nextLesson.id, podcast.id, 1);
            }
          }, 500);
        } else {
          console.log('🔒 Next lesson is locked, stopping auto-play:', nextLesson.title);
          setIsPlaying(false);
        }
      } else {
        console.log('🏁 No more lessons available for auto-play');
        setIsPlaying(false);
      }
      return;
    }

    console.log('✅ Completing lesson for the first time:', currentLesson.title);

    try {
      // ACTUALIZACIÓN INMEDIATA Y CRÍTICA: Update local state FIRST
      const updatedLessons = podcast.lessons.map(lesson => {
        if (lesson.id === currentLesson.id) {
          console.log('🔄 Updating lesson state immediately:', lesson.title, '-> isCompleted: true, isLocked: false');
          return { 
            ...lesson, 
            isCompleted: true, 
            isLocked: false // CRÍTICO: Asegurar que se desbloquea inmediatamente
          };
        }
        return lesson;
      });

      const nextLesson = findNextLesson();

      // Unlock next lesson
      if (nextLesson) {
        const nextLessonIndex = updatedLessons.findIndex(l => l.id === nextLesson.id);
        if (nextLessonIndex !== -1) {
          console.log('🔓 Unlocking next lesson:', nextLesson.title);
          updatedLessons[nextLessonIndex] = { 
            ...updatedLessons[nextLessonIndex], 
            isLocked: false 
          };
        }
      }

      // ACTUALIZACIÓN INMEDIATA: Update podcast state BEFORE database operations
      console.log('🔄 Updating podcast state immediately for real-time UI...');
      const updatedPodcast = { ...podcast, lessons: updatedLessons };
      setPodcast(updatedPodcast);

      // Update current lesson state immediately to reflect completion
      const updatedCurrentLesson = { ...currentLesson, isCompleted: true, isLocked: false };
      setCurrentLesson(updatedCurrentLesson);

      // Mark as complete in database (asynchronous - doesn't block UI)
      markLessonCompleteInDB(currentLesson.id, podcast.id).catch(error => {
        console.error('❌ Error marking lesson complete in DB:', error);
      });

      // Auto-advance to next lesson if available
      if (nextLesson) {
        console.log('⏭️ Auto-advancing to next lesson:', nextLesson.title);
        setCurrentLesson(nextLesson);
        
        // Small delay to ensure state update, then auto-play
        setTimeout(() => {
          setIsPlaying(true);
          if (user) {
            updateLessonPosition(nextLesson.id, podcast.id, 1);
          }
        }, 500);
      } else {
        console.log('🏁 Course completed - no more lessons');
        setIsPlaying(false);
      }

      // BACKGROUND REFRESH: Actualizar datos en segundo plano para sincronización
      console.log('📊 Refreshing progress data in background...');
      Promise.all([refetchLessonProgress(), refetchCourseProgress()]).then(() => {
        console.log('✅ Background progress data refresh completed');
      }).catch(error => {
        console.error('❌ Error in background refresh:', error);
      });

    } catch (error) {
      console.error('❌ Error completing lesson:', error);
    }
  }, [currentLesson, podcast, user, markLessonCompleteInDB, setPodcast, setCurrentLesson, setIsPlaying, refetchLessonProgress, refetchCourseProgress, updateLessonPosition]);

  return {
    handleLessonComplete
  };
}
