
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
  isAutoAdvanceAllowed: boolean,
  updateCourseProgress?: (courseId: string, updates: any) => Promise<void>
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
      
      // Check if this is the last lesson of the course
      const isLastLesson = !nextLesson;
      console.log('🎯 Is last lesson check:', { 
        lessonTitle: currentLesson.title, 
        isLastLesson, 
        wasAlreadyCompleted 
      });
      
      // Handle database updates for first-time completions FIRST
      if (!wasAlreadyCompleted) {
        console.log('💾 First completion - updating database immediately');
        await Promise.all([
          markLessonCompleteInDB(currentLesson.id, podcast.id),
          updateLessonPosition(currentLesson.id, podcast.id, 100)
        ]);
        console.log('✅ Database updates completed');
      }
      
      // IMPROVED: Auto-advance with better coordination
      if (isAutoAdvanceAllowed && nextLesson) {
        console.log('⏭️ AUTO-ADVANCE: Preparing to move to next lesson:', nextLesson.title);
        
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
        
        // IMPROVED: Better timing for auto-advance
        setTimeout(() => {
          console.log('⏭️ AUTO-ADVANCE: Now moving to next lesson:', nextLesson.title);
          setCurrentLesson({ ...nextLesson, isLocked: false });
          
          setTimeout(() => {
            console.log('▶️ AUTO-ADVANCE: Starting playback of next lesson:', nextLesson.title);
            setIsPlaying(true);
          }, 200);
        }, 100);
        
      } else {
        console.log('⏹️ NO AUTO-ADVANCE: End of course or auto-advance disabled');
        
        // Update completion status if this was first completion
        if (!wasAlreadyCompleted) {
          const updatedLessons = podcast.lessons.map(lesson => {
            if (lesson.id === currentLesson.id) {
              return { ...lesson, isCompleted: true };
            }
            return lesson;
          });
          
          const updatedPodcast = { ...podcast, lessons: updatedLessons };
          setPodcast(updatedPodcast);
          
          // 🎉 NEW: Check if course is now complete and trigger congratulations modal
          if (isLastLesson && updateCourseProgress) {
            console.log('🎉 COURSE COMPLETED! Updating course progress to 100%');
            
            // Update course progress to 100% completion
            await updateCourseProgress(podcast.id, {
              progress_percentage: 100,
              is_completed: true,
              completion_modal_shown: false // Important: Set to false to trigger modal
            });
            
            // Refetch course progress to trigger the completion modal
            setTimeout(() => {
              console.log('🔄 Refetching course progress to trigger completion modal');
              refetchCourseProgress();
            }, 500);
          }
        }
        
        setIsPlaying(false);
      }
      
      // Refetch lesson progress after all updates
      if (!wasAlreadyCompleted) {
        setTimeout(() => {
          console.log('🔄 Refetching lesson progress after completion');
          refetchLessonProgress();
        }, 200);
      }
      
    } catch (error) {
      console.error('❌ Error completing lesson:', error);
    } finally {
      setTimeout(() => {
        isCompletingRef.current = false;
      }, 500);
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
    isAutoAdvanceAllowed,
    updateCourseProgress,
    refetchLessonProgress,
    refetchCourseProgress
  ]);

  return { handleLessonComplete };
}
