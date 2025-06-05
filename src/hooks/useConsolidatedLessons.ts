
import { useState, useEffect, useCallback } from 'react';
import { Podcast, Lesson } from '@/types';
import { useUserLessonProgress } from './useUserLessonProgress';
import { useUserProgress } from './useUserProgress';
import { useAuth } from '@/components/auth/AuthProvider';

export function useConsolidatedLessons(podcast: Podcast | null, setPodcast: (podcast: Podcast) => void) {
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { user } = useAuth();
  
  const { 
    lessonProgress, 
    markLessonComplete: markLessonCompleteInDB, 
    updateLessonPosition,
    refetch: refetchLessonProgress
  } = useUserLessonProgress();
  
  const { 
    userProgress,
    updateCourseProgress, 
    refetch: refetchCourseProgress 
  } = useUserProgress();

  // Initialize podcast with correct lesson states from DB
  const initializePodcastWithProgress = useCallback(() => {
    if (!podcast || !user) return;

    console.log('Initializing podcast with progress from DB');
    
    // Update lessons with progress from database
    const updatedLessons = podcast.lessons.map(lesson => {
      const progress = lessonProgress.find(p => p.lesson_id === lesson.id);
      return {
        ...lesson,
        isCompleted: progress?.is_completed || false,
        isLocked: true // Start with all locked, we'll unlock properly below
      };
    });

    // Apply proper unlocking logic: only first lesson and completed lesson's next should be unlocked
    const modulesWithLessons = podcast.modules.map(module => ({
      ...module,
      lessons: module.lessonIds.map(id => updatedLessons.find(l => l.id === id)).filter(Boolean) as Lesson[]
    }));

    // Check if course is completed
    const courseProgress = userProgress.find(p => p.course_id === podcast.id);
    const isCourseCompleted = courseProgress?.is_completed || false;

    if (isCourseCompleted) {
      // If course is completed, unlock ALL lessons for free replay
      console.log('Course is completed, unlocking all lessons for free replay');
      updatedLessons.forEach((lesson, index) => {
        updatedLessons[index] = { ...lesson, isLocked: false };
      });
    } else {
      // Normal unlocking logic for in-progress courses
      // Unlock first lesson of first module
      if (modulesWithLessons.length > 0 && modulesWithLessons[0].lessons.length > 0) {
        const firstLessonId = modulesWithLessons[0].lessons[0].id;
        const firstLessonIndex = updatedLessons.findIndex(l => l.id === firstLessonId);
        if (firstLessonIndex !== -1) {
          updatedLessons[firstLessonIndex] = { ...updatedLessons[firstLessonIndex], isLocked: false };
        }
      }

      // Unlock lessons following completed ones
      modulesWithLessons.forEach(module => {
        module.lessons.forEach((lesson, index) => {
          if (lesson.isCompleted && index < module.lessons.length - 1) {
            // Unlock next lesson in same module
            const nextLessonId = module.lessons[index + 1].id;
            const nextLessonIndex = updatedLessons.findIndex(l => l.id === nextLessonId);
            if (nextLessonIndex !== -1) {
              updatedLessons[nextLessonIndex] = { ...updatedLessons[nextLessonIndex], isLocked: false };
            }
          } else if (lesson.isCompleted && index === module.lessons.length - 1) {
            // If last lesson of module is completed, unlock first lesson of next module
            const currentModuleIndex = modulesWithLessons.findIndex(m => m.id === module.id);
            if (currentModuleIndex < modulesWithLessons.length - 1) {
              const nextModule = modulesWithLessons[currentModuleIndex + 1];
              if (nextModule.lessons.length > 0) {
                const nextModuleFirstLessonId = nextModule.lessons[0].id;
                const nextModuleFirstLessonIndex = updatedLessons.findIndex(l => l.id === nextModuleFirstLessonId);
                if (nextModuleFirstLessonIndex !== -1) {
                  updatedLessons[nextModuleFirstLessonIndex] = { ...updatedLessons[nextModuleFirstLessonIndex], isLocked: false };
                }
              }
            }
          }
        });
      });
    }

    setPodcast({ ...podcast, lessons: updatedLessons });
  }, [podcast, lessonProgress, userProgress, user, setPodcast]);

  // Initialize current lesson (improved logic for completed courses)
  const initializeCurrentLesson = useCallback(() => {
    if (!podcast) return;

    console.log('Initializing current lesson');
    
    // Check if course is completed
    const courseProgress = userProgress.find(p => p.course_id === podcast.id);
    const isCourseCompleted = courseProgress?.is_completed || false;

    if (isCourseCompleted) {
      // For completed courses, default to first lesson but don't override user selection
      if (!currentLesson) {
        const firstLesson = podcast.lessons[0];
        if (firstLesson) {
          console.log('Course completed - setting current lesson to first lesson:', firstLesson.title);
          setCurrentLesson(firstLesson);
        }
      }
    } else {
      // For in-progress courses, find first incomplete lesson that's unlocked
      const firstIncompleteLesson = podcast.lessons.find(lesson => !lesson.isCompleted && !lesson.isLocked);
      
      if (firstIncompleteLesson) {
        console.log('Setting current lesson to first incomplete:', firstIncompleteLesson.title);
        setCurrentLesson(firstIncompleteLesson);
      } else {
        // If all lessons are completed or none are unlocked, set to first lesson
        const firstLesson = podcast.lessons[0];
        if (firstLesson) {
          console.log('Setting current lesson to first lesson:', firstLesson.title);
          setCurrentLesson(firstLesson);
        }
      }
    }
  }, [podcast, userProgress, currentLesson]);

  // Handle lesson selection (improved for completed courses)
  const handleSelectLesson = useCallback((lesson: Lesson) => {
    // Check if course is completed
    const courseProgress = userProgress.find(p => p.course_id === podcast?.id);
    const isCourseCompleted = courseProgress?.is_completed || false;

    if (!isCourseCompleted && lesson.isLocked) {
      console.log('Lesson is locked, cannot select:', lesson.title);
      return;
    }

    console.log('Selecting lesson:', lesson.title);
    
    // If selecting the same lesson that's already playing, just toggle play/pause
    if (currentLesson && lesson.id === currentLesson.id && isPlaying) {
      setIsPlaying(false);
      return;
    }

    setCurrentLesson(lesson);
    setIsPlaying(true);

    // Track lesson start in database (only for in-progress courses)
    if (podcast && user && !isCourseCompleted) {
      updateLessonPosition(lesson.id, podcast.id, 1);
    }
  }, [currentLesson, isPlaying, podcast, user, userProgress, updateLessonPosition]);

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
  }, [currentLesson, podcast, user, markLessonCompleteInDB, setPodcast, refetchLessonProgress, refetchCourseProgress, updateLessonPosition]);

  // Handle progress updates during playback (only for incomplete courses)
  const handleProgressUpdate = useCallback((position: number) => {
    if (!currentLesson || !podcast || !user) return;
    
    // Check if course is completed
    const courseProgress = userProgress.find(p => p.course_id === podcast.id);
    const isCourseCompleted = courseProgress?.is_completed || false;

    // Only update progress for incomplete courses and incomplete lessons
    if (!isCourseCompleted && position > 5 && !currentLesson.isCompleted) {
      updateLessonPosition(currentLesson.id, podcast.id, position);
    }
  }, [currentLesson, podcast, user, userProgress, updateLessonPosition]);

  // Toggle play/pause
  const handleTogglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Initialize when podcast or lesson progress changes
  useEffect(() => {
    if (podcast && lessonProgress.length >= 0) { // >= 0 to handle empty arrays
      initializePodcastWithProgress();
    }
  }, [podcast?.id, lessonProgress, userProgress, initializePodcastWithProgress]);

  // Initialize current lesson when podcast is ready
  useEffect(() => {
    if (podcast && podcast.lessons.length > 0) {
      initializeCurrentLesson();
    }
  }, [podcast?.lessons, userProgress, initializeCurrentLesson]);

  return {
    currentLesson,
    setCurrentLesson,
    isPlaying,
    setIsPlaying,
    initializeCurrentLesson,
    handleSelectLesson,
    handleTogglePlay,
    handleLessonComplete,
    handleProgressUpdate,
    initializePodcastWithProgress
  };
}
