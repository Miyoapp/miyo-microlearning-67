
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
      // CRÍTICO: Distinguir entre completion real y replay
      const isReplay = currentLesson.isCompleted;
      const nextLesson = getNextLesson(currentLesson, podcast.lessons, podcast.modules);
      
      if (isReplay) {
        console.log('🔄 REPLAY MODE: No progress changes, continue to next lesson');
        
        // En replay, NO actualizar progreso, solo continuar con auto-advance
        if (isAutoAdvanceAllowed && nextLesson) {
          console.log('⏭️ Auto-advance from replay to:', nextLesson.title);
          setCurrentLesson(nextLesson);
          setIsPlaying(true);
        } else {
          console.log('⏹️ End of replay sequence');
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
        Promise.all([
          markLessonCompleteInDB(currentLesson.id, podcast.id),
          updateLessonPosition(currentLesson.id, podcast.id, 100)
        ]).then(() => {
          console.log('💾 Background DB updates completed for first completion');
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
