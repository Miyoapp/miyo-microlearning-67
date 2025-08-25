
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
        nextLessonTitle: nextLesson?.title || 'none'
      });
      
      // CRITICAL: Execute database updates IMMEDIATELY for first-time completions
      if (!wasAlreadyCompleted) {
        console.log('💾 CRITICAL: First completion - executing immediate DB updates');
        
        await Promise.all([
          markLessonCompleteInDB(currentLesson.id, podcast.id),
          updateLessonPosition(currentLesson.id, podcast.id, 100)
        ]);
        
        console.log('✅ CRITICAL: Database updates completed immediately');
      }
      
      // AUTO-ADVANCE: Improved timing coordination with transitions
      if (isAutoAdvanceAllowed && nextLesson) {
        console.log('⏭️ AUTO-ADVANCE: Initiating coordinated transition to:', nextLesson.title);
        
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
        
        // CRITICAL FIX: Improved timing to coordinate with transition state
        setTimeout(() => {
          console.log('⏭️ AUTO-ADVANCE: Setting next lesson (transition-aware):', nextLesson.title);
          setCurrentLesson({ ...nextLesson, isLocked: false });
          
          // CRITICAL FIX: Longer delay to ensure audio initialization completes
          setTimeout(() => {
            console.log('▶️ AUTO-ADVANCE: Starting playback after initialization:', nextLesson.title);
            setIsPlaying(true);
          }, 600); // Increased from 400ms to allow full initialization
        }, 300); // Increased from 200ms to allow state updates
        
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
            }, 500);
          }
        }
        
        setIsPlaying(false);
      }
      
      // Refetch progress after successful completion
      if (!wasAlreadyCompleted) {
        setTimeout(() => {
          console.log('🔄 Refetching lesson progress after completion');
          refetchLessonProgress();
        }, 400); // Reduced from 300ms to coordinate better
      }
      
    } catch (error) {
      console.error('❌ Error completing lesson:', error);
    } finally {
      setTimeout(() => {
        isCompletingRef.current = false;
      }, 1000); // Increased from 800ms to ensure full cycle completion
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
