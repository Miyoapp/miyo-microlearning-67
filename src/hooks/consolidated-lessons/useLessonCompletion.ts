
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
      const wasAlreadyCompleted = currentLesson.isCompleted;
      const nextLesson = getNextLesson(currentLesson, podcast.lessons, podcast.modules);
      
      // UNIFIED AUTO-ADVANCE LOGIC: Always advance if allowed and next lesson exists
      if (isAutoAdvanceAllowed && nextLesson) {
        console.log('⏭️ AUTO-ADVANCE: Moving to next lesson:', nextLesson.title);
        
        // Update podcast state to unlock next lesson if needed
        const updatedLessons = podcast.lessons.map(lesson => {
          if (lesson.id === currentLesson.id && !wasAlreadyCompleted) {
            return { ...lesson, isCompleted: true };
          }
          if (lesson.id === nextLesson.id) {
            return { ...lesson, isLocked: false };
          }
          return lesson;
        });
        
        const updatedPodcast = { ...podcast, lessons: updatedLessons };
        setPodcast(updatedPodcast);
        
        // Set next lesson and start playing
        setCurrentLesson({ ...nextLesson, isLocked: false });
        setIsPlaying(true);
        
      } else {
        console.log('⏹️ NO AUTO-ADVANCE: End of course or auto-advance disabled');
        
        // Just update completion status if this was first completion
        if (!wasAlreadyCompleted) {
          const updatedLessons = podcast.lessons.map(lesson => {
            if (lesson.id === currentLesson.id) {
              return { ...lesson, isCompleted: true };
            }
            return lesson;
          });
          
          const updatedPodcast = { ...podcast, lessons: updatedLessons };
          setPodcast(updatedPodcast);
        }
        
        setIsPlaying(false);
      }
      
      // Handle database updates for first-time completions
      if (!wasAlreadyCompleted) {
        console.log('💾 First completion - updating database');
        Promise.all([
          markLessonCompleteInDB(currentLesson.id, podcast.id),
          updateLessonPosition(currentLesson.id, podcast.id, 100)
        ]).then(() => {
          console.log('✅ Database updates completed');
        }).catch(dbError => {
          console.error('❌ Database update failed:', dbError);
        });
      } else {
        console.log('🔄 Replay completion - no database updates needed');
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
