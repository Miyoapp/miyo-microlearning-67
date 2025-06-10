
import { useCallback } from 'react';
import { Lesson, Podcast } from '@/types';
import { startTransition } from 'react';

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
  refetchCourseProgress: () => Promise<void>,
  isAutoAdvanceAllowed: () => boolean
) {
  // Handle lesson completion
  const handleLessonComplete = useCallback(async () => {
    if (!currentLesson || !podcast || !user) return;

    console.log('🎯 Lesson completion triggered for:', currentLesson.title, 'isCompleted:', currentLesson.isCompleted);

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

    // OPTIMIZED: Handle already completed lessons with immediate auto-advance
    if (currentLesson.isCompleted) {
      console.log('🔄 Lesson already completed:', currentLesson.title);
      
      // PROTECTION: Check if auto-advance is allowed
      if (!isAutoAdvanceAllowed()) {
        console.log('🚫 AUTO-ADVANCE BLOCKED: Manual selection active, not advancing');
        setIsPlaying(false);
        return;
      }
      
      const nextLesson = findNextLesson();
      
      if (nextLesson) {
        const canPlayNext = nextLesson.isCompleted || !nextLesson.isLocked;
        
        if (canPlayNext) {
          console.log('⏭️ Auto-advancing to next lesson (immediate):', nextLesson.title);
          
          // OPTIMIZED: Immediate transition for already completed lessons
          setCurrentLesson(nextLesson);
          setIsPlaying(true);
          
          // Update position without delay for completed lessons replay
          if (user && !nextLesson.isCompleted) {
            updateLessonPosition(nextLesson.id, podcast.id, 1);
          }
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
      // OPTIMIZED: Batch state updates for better performance
      const nextLesson = findNextLesson();
      
      // Update local state FIRST with batched updates
      const updatedLessons = podcast.lessons.map(lesson => {
        if (lesson.id === currentLesson.id) {
          console.log('🔄 Updating lesson state immediately:', lesson.title, '-> isCompleted: true, isLocked: false');
          return { 
            ...lesson, 
            isCompleted: true, 
            isLocked: false
          };
        }
        return lesson;
      });

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

      // OPTIMIZED: Use startTransition for non-urgent UI updates
      startTransition(() => {
        console.log('🔄 Updating podcast state immediately for real-time UI...');
        const updatedPodcast = { ...podcast, lessons: updatedLessons };
        setPodcast(updatedPodcast);
      });

      // Update current lesson state immediately
      const updatedCurrentLesson = { ...currentLesson, isCompleted: true, isLocked: false };
      setCurrentLesson(updatedCurrentLesson);

      // OPTIMIZED: Handle auto-advance with minimal delay for first-time completion
      if (nextLesson && isAutoAdvanceAllowed()) {
        console.log('⏭️ Auto-advancing to next lesson (first completion):', nextLesson.title);
        
        // Slightly shorter delay for smoother UX on first completion
        setTimeout(() => {
          setCurrentLesson(nextLesson);
          setIsPlaying(true);
          if (user) {
            updateLessonPosition(nextLesson.id, podcast.id, 1);
          }
        }, 200); // Reduced from 500ms to 200ms
      } else if (nextLesson && !isAutoAdvanceAllowed()) {
        console.log('🚫 AUTO-ADVANCE BLOCKED: Manual selection active, not advancing to:', nextLesson.title);
        setIsPlaying(false);
      } else {
        console.log('🏁 Course completed - no more lessons');
        setIsPlaying(false);
      }

      // Mark as complete in database (asynchronous, non-blocking)
      markLessonCompleteInDB(currentLesson.id, podcast.id).catch(error => {
        console.error('❌ Error marking lesson complete in DB:', error);
      });

      // Background refresh with lower priority
      startTransition(() => {
        console.log('📊 Refreshing progress data in background...');
        Promise.all([refetchLessonProgress(), refetchCourseProgress()]).then(() => {
          console.log('✅ Background progress data refresh completed');
        }).catch(error => {
          console.error('❌ Error in background refresh:', error);
        });
      });

    } catch (error) {
      console.error('❌ Error completing lesson:', error);
    }
  }, [currentLesson, podcast, user, markLessonCompleteInDB, setPodcast, setCurrentLesson, setIsPlaying, refetchLessonProgress, refetchCourseProgress, updateLessonPosition, isAutoAdvanceAllowed]);

  return {
    handleLessonComplete
  };
}
