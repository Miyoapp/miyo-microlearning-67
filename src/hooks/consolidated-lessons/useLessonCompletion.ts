
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
  
  const isCompletingRef = useRef(false);
  
  const handleLessonComplete = useCallback(async () => {
    if (!currentLesson || !podcast || !user) {
      console.log('❌ Cannot complete lesson: missing dependencies');
      return;
    }

    if (isCompletingRef.current) {
      console.log('🔄 Lesson completion already in progress, skipping...');
      return;
    }

    isCompletingRef.current = true;
    console.log('🏁 LESSON COMPLETE:', currentLesson.title, 'Already completed:', currentLesson.isCompleted);
    
    try {
      const isReplay = currentLesson.isCompleted;
      const nextLesson = getNextLesson(currentLesson, podcast.lessons, podcast.modules);
      
      // Detectar modo review (curso 100% completo)
      const isReviewMode = podcast.lessons.every(lesson => lesson.isCompleted);
      
      if (isReviewMode) {
        console.log('🏆 REVIEW MODE (100% complete): Smart auto-advance');
        
        if (isAutoAdvanceAllowed && nextLesson) {
          console.log('⏭️ Review mode auto-advance to:', nextLesson.title);
          setCurrentLesson(nextLesson);
          setIsPlaying(true);
        } else {
          console.log('⏹️ End of review sequence');
          setIsPlaying(false);
        }
        
      } else if (isReplay) {
        console.log('🔄 REPLAY MODE: Continuing from completed lesson');
        
        if (isAutoAdvanceAllowed && nextLesson) {
          const canPlayNext = nextLesson.isCompleted || !nextLesson.isLocked;
          
          if (canPlayNext) {
            console.log('⏭️ Auto-advance from replay to:', nextLesson.title);
            setCurrentLesson(nextLesson);
            setIsPlaying(true);
          } else {
            console.log('🚫 Next lesson not available');
            setIsPlaying(false);
          }
        } else {
          console.log('⏹️ End of replay sequence');
          setIsPlaying(false);
        }
        
      } else {
        console.log('✅ FIRST COMPLETION: Update progress and auto-advance');
        
        // CRÍTICO: NO actualizar inmediatamente el estado visual del podcast
        // Solo actualizar la base de datos en background
        console.log('💾 Marking lesson as completed in DB (background)');
        
        // Background DB updates (sin actualizar estado visual inmediatamente)
        Promise.all([
          markLessonCompleteInDB(currentLesson.id, podcast.id),
          updateLessonPosition(currentLesson.id, podcast.id, 100)
        ]).then(() => {
          console.log('💾 Background DB updates completed - refreshing data');
          // DESPUÉS de que la DB se actualice, refrescar los datos
          refetchLessonProgress();
          refetchCourseProgress();
        }).catch(dbError => {
          console.error('❌ Background DB update failed:', dbError);
        });
        
        // CRÍTICO: Desbloquear siguiente lección SIN marcar la actual como completada visualmente
        if (nextLesson) {
          console.log('🔓 Unlocking next lesson for auto-advance:', nextLesson.title);
          
          const updatedLessons = podcast.lessons.map(lesson => {
            // NO cambiar la lección actual - mantener estado visual
            if (nextLesson && lesson.id === nextLesson.id) {
              console.log('🔓 Desbloqueando siguiente lección:', lesson.title);
              return { ...lesson, isLocked: false };
            }
            return lesson;
          });
          
          const updatedPodcast = { ...podcast, lessons: updatedLessons };
          
          // Actualizar podcast SOLO para desbloquear siguiente lección
          console.log('🔄 Updating podcast to unlock next lesson (visual state preserved)');
          setPodcast(updatedPodcast);
          
          // Auto-advance con delay para permitir actualización visual
          if (isAutoAdvanceAllowed) {
            setTimeout(() => {
              console.log('⏭️ AUTO-ADVANCE to unlocked next lesson:', nextLesson.title);
              const unlockedNextLesson = { ...nextLesson, isLocked: false };
              setCurrentLesson(unlockedNextLesson);
              setIsPlaying(true);
            }, 300);
          }
        } else {
          console.log('⏹️ No next lesson available');
          setIsPlaying(false);
        }
      }
      
    } catch (error) {
      console.error('❌ Error completing lesson:', error);
    } finally {
      setTimeout(() => {
        isCompletingRef.current = false;
      }, 1000);
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
