
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
      const isLastLesson = !nextLesson;
      
      console.log('🎯 Completion context:', { 
        lessonTitle: currentLesson.title, 
        isLastLesson, 
        wasAlreadyCompleted,
        nextLessonTitle: nextLesson?.title || 'none',
        isAutoAdvanceAllowed
      });
      
      // Execute database updates IMMEDIATELY for first-time completions
      if (!wasAlreadyCompleted) {
        console.log('💾 CRITICAL: First completion - executing immediate DB updates');
        
        await Promise.all([
          markLessonCompleteInDB(currentLesson.id, podcast.id),
          updateLessonPosition(currentLesson.id, podcast.id, 100)
        ]);
        
        console.log('✅ CRITICAL: Database updates completed immediately');
      }
      
      // FIXED: AUTO-ADVANCE - Remove any blocking logic for completed lessons
      if (isAutoAdvanceAllowed && nextLesson) {
        console.log('⏭️ AUTO-ADVANCE: Initiating transition to:', nextLesson.title, '(works for any lesson state)');
        
        // Update podcast state first to unlock next lesson
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
        
        // CRITICAL FIX: Set lesson with proper auto-advance flag context
        setTimeout(() => {
          console.log('⏭️ AUTO-ADVANCE: Setting next lesson for auto-advance:', nextLesson.title);
          
          // FIXED: Always mark as auto-advance replay when using auto-advance
          const nextLessonWithAutoAdvance = { 
            ...nextLesson, 
            isLocked: false,
            // CRITICAL: Mark this as auto-advance replay for proper audio handling
            _isAutoAdvanceReplay: true
          };
          
          setCurrentLesson(nextLessonWithAutoAdvance);
          
          // Start playback after brief initialization
          setTimeout(() => {
            console.log('▶️ AUTO-ADVANCE: Starting playback:', nextLesson.title);
            setIsPlaying(true);
          }, 200);
        }, 100);
        
      } else {
        console.log('⏹️ NO AUTO-ADVANCE: End of course or disabled');
        
        // Update completion status for non-auto-advance scenarios
        if (!wasAlreadyCompleted) {
          const updatedLessons = podcast.lessons.map(lesson => {
            if (lesson.id === currentLesson.id) {
              return { ...lesson, isCompleted: true };
            }
            return lesson;
          });
          
          const updatedPodcast = { ...podcast, lessons: updatedLessons };
          setPodcast(updatedPodcast);
          
          // Check for course completion
          if (isLastLesson && updateCourseProgress) {
            console.log('🎉 COURSE COMPLETED! Updating course progress');
            
            await updateCourseProgress(podcast.id, {
              progress_percentage: 100,
              is_completed: true,
              completion_modal_shown: false
            });
            
            setTimeout(() => {
              refetchCourseProgress();
            }, 200);
          }
        }
        
        setIsPlaying(false);
      }
      
      // Refetch progress after successful completion
      if (!wasAlreadyCompleted) {
        setTimeout(() => {
          console.log('🔄 Refetching lesson progress after completion');
          refetchLessonProgress();
        }, 300);
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
