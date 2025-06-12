
import { useCallback, useRef } from 'react';
import { Lesson, Podcast } from '@/types';
import { User } from '@supabase/supabase-js';
import { getNextLesson } from './lessonOrderUtils';
import { toast } from 'sonner';

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
      
      // NUEVO: Detectar modo review (curso 100% completo)
      const isReviewMode = podcast.lessons.every(lesson => lesson.isCompleted);
      
      if (isReviewMode) {
        console.log('🏆 REVIEW MODE (100% complete): No progress changes, smart auto-advance');
        
        // En review mode, permitir auto-advance a cualquier lección sin cambiar progreso
        if (isAutoAdvanceAllowed && nextLesson) {
          console.log('⏭️ Review mode auto-advance to:', nextLesson.title);
          setCurrentLesson(nextLesson);
          setIsPlaying(true);
        } else {
          console.log('⏹️ End of review sequence or auto-advance disabled');
          setIsPlaying(false);
        }
        
      } else if (isReplay) {
        console.log('🔄 REPLAY MODE: Continuing sequence from completed lesson');
        
        // CORREGIDO: En replay, continuar la secuencia y marcar siguientes como completadas
        if (isAutoAdvanceAllowed && nextLesson) {
          const canPlayNext = nextLesson.isCompleted || !nextLesson.isLocked;
          
          if (canPlayNext) {
            console.log('⏭️ Auto-advance from replay to:', nextLesson.title, 'willComplete:', !nextLesson.isCompleted);
            
            // Si la siguiente lección no está completada, completarla ahora
            if (!nextLesson.isCompleted) {
              const updatedLessons = podcast.lessons.map(lesson => {
                if (lesson.id === nextLesson.id) {
                  return { ...lesson, isCompleted: true };
                }
                return lesson;
              });
              
              const updatedPodcast = { ...podcast, lessons: updatedLessons };
              setPodcast(updatedPodcast);
              
              // Marcar como completada en BD
              markLessonCompleteInDB(nextLesson.id, podcast.id);
              updateLessonPosition(nextLesson.id, podcast.id, 100);
              
              // NEW: Signal progress update
              setTimeout(() => {
                refetchCourseProgress();
              }, 300);
            }
            
            setCurrentLesson({ ...nextLesson, isCompleted: true });
            setIsPlaying(true);
          } else {
            console.log('🚫 Next lesson not available - stopping playback');
            setIsPlaying(false);
          }
        } else {
          console.log('⏹️ End of replay sequence or auto-advance disabled');
          setIsPlaying(false);
        }
        
      } else {
        console.log('✅ FIRST COMPLETION: Update progress and continue');
        
        // Completion real: actualizar progreso y desbloquear siguiente
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
        
        // NEW: Display visual feedback on completion
        toast.success('¡Lección completada!', {
          description: `Has completado: ${currentLesson.title}`,
          duration: 3000,
        });
        
        // Auto-advance a la siguiente lección desbloqueada
        if (isAutoAdvanceAllowed && nextLesson) {
          console.log('⏭️ Auto-advance to newly unlocked:', nextLesson.title);
          const updatedNextLesson = { ...nextLesson, isLocked: false };
          setCurrentLesson(updatedNextLesson);
          setIsPlaying(true);
        } else {
          console.log('⏹️ No auto-advance: reached end or not allowed');
          setIsPlaying(false);
        }
        
        // Background DB updates solo para completion real
        try {
          // Execute DB updates in parallel for efficiency
          await Promise.all([
            markLessonCompleteInDB(currentLesson.id, podcast.id),
            updateLessonPosition(currentLesson.id, podcast.id, 100)
          ]);
          
          console.log('💾 Background DB updates completed for first completion');
          
          // NEW: Explicitly trigger refresh after background updates
          setTimeout(() => {
            console.log('🔄 Triggering progress refresh after DB updates');
            refetchLessonProgress();
            refetchCourseProgress(); 
          }, 300);
          
          // Check if this completion causes a progress threshold to be reached
          const estimatedProgress = Math.round((updatedLessons.filter(l => l.isCompleted).length / podcast.lessons.length) * 100);
          
          if (estimatedProgress >= 50 && estimatedProgress < 100) {
            toast.success('¡Has llegado a mitad del camino!', { 
              duration: 4000,
            });
          } else if (estimatedProgress >= 100) {
            toast.success('¡Felicidades! Has completado todo el curso', {
              duration: 5000,
            });
          }
          
        } catch (dbError) {
          console.error('❌ Background DB update failed:', dbError);
        }
      }
      
    } catch (error) {
      console.error('❌ Error completing lesson:', error);
    } finally {
      setTimeout(() => {
        isCompletingRef.current = false;
      }, 300);
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
