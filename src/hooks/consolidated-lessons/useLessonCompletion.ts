
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

    console.log('Completing lesson:', currentLesson.title);

    try {
      // Mark as complete in database first
      await markLessonCompleteInDB(currentLesson.id, podcast.id);
      
      // Update local podcast state
      const updatedLessons = podcast.lessons.map(lesson => {
        if (lesson.id === currentLesson.id) {
          return { ...lesson, isCompleted: true };
        }
        return lesson;
      });

      // Find and unlock next lesson
      const currentModule = podcast.modules.find(module => 
        module.lessonIds.includes(currentLesson.id)
      );
      
      if (currentModule) {
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

        // Unlock next lesson
        if (nextLessonId) {
          const nextLessonIndex = updatedLessons.findIndex(l => l.id === nextLessonId);
          if (nextLessonIndex !== -1) {
            updatedLessons[nextLessonIndex] = { 
              ...updatedLessons[nextLessonIndex], 
              isLocked: false 
            };
            
            // Auto-advance to next lesson
            const nextLesson = updatedLessons[nextLessonIndex];
            console.log('Auto-advancing to next lesson:', nextLesson.title);
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
          console.log('Course completed - no more lessons');
          setIsPlaying(false);
        }
      }

      // Update podcast with new lesson states
      setPodcast({ ...podcast, lessons: updatedLessons });

      // Refresh progress data to update UI immediately
      console.log('Refreshing progress data after lesson completion...');
      await Promise.all([refetchLessonProgress(), refetchCourseProgress()]);
      console.log('Progress data refreshed successfully');

    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  }, [currentLesson, podcast, user, markLessonCompleteInDB, setPodcast, setCurrentLesson, setIsPlaying, refetchLessonProgress, refetchCourseProgress, updateLessonPosition]);

  return {
    handleLessonComplete
  };
}
