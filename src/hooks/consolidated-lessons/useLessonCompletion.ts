
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
            
            // Si la siguiente no está completada, completarla
            if (!nextLesson.isCompleted) {
              const updatedLessons = podcast.lessons.map(lesson => {
                if (lesson.id === nextLesson.id) {
                  return { ...lesson, isCompleted: true };
                }
                return lesson;
              });
              
              const updatedPodcast = { ...podcast, lessons: updatedLessons };
              setPodcast(updatedPodcast);
              
              markLessonCompleteInDB(nextLesson.id, podcast.id);
              updateLessonPosition(nextLesson.id, podcast.id, 100);
            }
            
            setCurrentLesson({ ...nextLesson, isCompleted: true });
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
        
        // CRÍTICO: Actualización síncrona de estados ANTES del auto-advance
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
        
        // FORZAR actualización inmediata del podcast para re-render visual
        console.log('🔄 UPDATING PODCAST STATE - Current becomes 🏆, Next becomes ▶️ morado');
        setPodcast(updatedPodcast);
        
        // DELAY mínimo para permitir re-render antes del auto-advance
        setTimeout(() => {
          if (isAutoAdvanceAllowed && nextLesson) {
            console.log('⏭️ AUTO-ADVANCE to newly unlocked:', nextLesson.title);
            const unlockedNextLesson = { ...nextLesson, isLocked: false };
            setCurrentLesson(unlockedNextLesson);
            setIsPlaying(true);
          } else {
            console.log('⏹️ No auto-advance: reached end');
            setIsPlaying(false);
          }
        }, 100);
        
        // Background DB updates
        Promise.all([
          markLessonCompleteInDB(currentLesson.id, podcast.id),
          updateLessonPosition(currentLesson.id, podcast.id, 100)
        ]).then(() => {
          console.log('💾 Background DB updates completed');
        }).catch(dbError => {
          console.error('❌ Background DB update failed:', dbError);
        });
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
    isAutoAdvanceAllowed
  ]);

  return { handleLessonComplete };
}
