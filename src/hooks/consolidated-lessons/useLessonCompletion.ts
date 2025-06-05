
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
      // Mark as complete in database first
      await markLessonCompleteInDB(currentLesson.id, podcast.id);
      
      // Update local podcast state INMEDIATAMENTE
      const updatedLessons = podcast.lessons.map(lesson => {
        if (lesson.id === currentLesson.id) {
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
          updatedLessons[nextLessonIndex] = { 
            ...updatedLessons[nextLessonIndex], 
            isLocked: false 
          };
          
          // Auto-advance to next lesson
          console.log('⏭️ Auto-advancing to next lesson:', nextLesson.title);
          setCurrentLesson(nextLesson);
          
          // Small delay to ensure state update, then auto-play
          setTimeout(() => {
            setIsPlaying(true);
            if (user) {
              updateLessonPosition(nextLesson.id, podcast.id, 1);
            }
          }, 500);
        }
      } else {
        console.log('🏁 Course completed - no more lessons');
        setIsPlaying(false);
      }

      // ACTUALIZACIÓN INMEDIATA: Update podcast with new lesson states
      console.log('🔄 Updating podcast state immediately...');
      setPodcast({ ...podcast, lessons: updatedLessons });

      // MEJORA PARA TIEMPO REAL: Refresh progress data to update UI immediately
      console.log('📊 Refreshing progress data for real-time updates...');
      const refreshPromises = [refetchLessonProgress(), refetchCourseProgress()];
      
      // No esperar a que termine el refresh para actualizar la UI
      Promise.all(refreshPromises).then(() => {
        console.log('✅ Progress data refreshed successfully');
      }).catch(error => {
        console.error('❌ Error refreshing progress data:', error);
      });

    } catch (error) {
      console.error('❌ Error completing lesson:', error);
    }
  }, [currentLesson, podcast, user, markLessonCompleteInDB, setPodcast, setCurrentLesson, setIsPlaying, refetchLessonProgress, refetchCourseProgress, updateLessonPosition]);

  return {
    handleLessonComplete
  };
}
