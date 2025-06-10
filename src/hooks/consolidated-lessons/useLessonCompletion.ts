
import { useCallback } from 'react';
import { Lesson, Podcast } from '@/types';
import { User } from '@supabase/supabase-js';

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
  
  const handleLessonComplete = useCallback(async () => {
    if (!currentLesson || !podcast || !user) {
      console.log('❌ Cannot complete lesson: missing dependencies');
      return;
    }

    console.log('🏁 LESSON COMPLETE:', currentLesson.title);
    
    try {
      // 1. Mark lesson as complete in database
      await markLessonCompleteInDB(currentLesson.id, podcast.id);
      
      // 2. Update lesson position to 100%
      await updateLessonPosition(currentLesson.id, podcast.id, 100);
      
      // 3. Update local podcast state immediately
      const updatedLessons = podcast.lessons.map(lesson => 
        lesson.id === currentLesson.id 
          ? { ...lesson, isCompleted: true }
          : lesson
      );
      
      // 4. Unlock next lesson
      const currentIndex = podcast.lessons.findIndex(l => l.id === currentLesson.id);
      if (currentIndex !== -1 && currentIndex < podcast.lessons.length - 1) {
        const nextLessonIndex = currentIndex + 1;
        updatedLessons[nextLessonIndex] = {
          ...updatedLessons[nextLessonIndex],
          isLocked: false
        };
        
        console.log('🔓 Unlocked next lesson:', updatedLessons[nextLessonIndex].title);
      }
      
      // 5. Update podcast state
      const updatedPodcast = { ...podcast, lessons: updatedLessons };
      setPodcast(updatedPodcast);
      
      // 6. Auto-advance to next lesson if allowed
      if (isAutoAdvanceAllowed && currentIndex !== -1 && currentIndex < podcast.lessons.length - 1) {
        const nextLesson = updatedLessons[currentIndex + 1];
        console.log('⏭️ Auto-advancing to next lesson:', nextLesson.title);
        
        // Small delay for smooth transition
        setTimeout(() => {
          setCurrentLesson(nextLesson);
          setIsPlaying(true);
        }, 1000);
      } else {
        console.log('⏹️ No auto-advance: reached end or not allowed');
        setIsPlaying(false);
      }
      
      // 7. Refresh progress data
      setTimeout(() => {
        refetchLessonProgress();
        refetchCourseProgress();
      }, 500);
      
    } catch (error) {
      console.error('❌ Error completing lesson:', error);
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
