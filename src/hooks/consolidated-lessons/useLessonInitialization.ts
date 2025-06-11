
import { useState, useCallback, useRef } from 'react';
import { Podcast, Lesson } from '@/types';
import { UserLessonProgress } from '@/hooks/useUserLessonProgress';
import { UserCourseProgress } from '@/hooks/useUserProgress';
import { User } from '@supabase/supabase-js';
import { getOrderedLessons, getFirstLesson, isFirstLessonInSequence } from './lessonOrderUtils';

export function useLessonInitialization(
  podcast: Podcast | null,
  lessonProgress: UserLessonProgress[],
  userProgress: UserCourseProgress[],
  user: User | null,
  setPodcast: (podcast: Podcast) => void
) {
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const hasInitialized = useRef(false);

  const calculateLessonStates = useCallback((lessons: Lesson[], courseId: string) => {
    console.log('🔧 Calculating lesson states for course:', courseId);
    
    const courseProgress = userProgress.find(p => p.course_id === courseId);
    const isReviewMode = courseProgress?.is_completed && courseProgress?.progress_percentage === 100;
    
    const orderedLessons = podcast ? getOrderedLessons(lessons, podcast.modules) : lessons;
    
    return lessons.map((lesson) => {
      const progress = lessonProgress.find(p => p.lesson_id === lesson.id);
      const isCompleted = progress?.is_completed || false;
      const isFirstInSequence = podcast ? isFirstLessonInSequence(lesson, lessons, podcast.modules) : false;
      
      // ESCENARIO 1: Modo revisión (100% completo) - todas desbloqueadas
      if (isReviewMode) {
        console.log('🏆 Review mode - all lessons unlocked for:', lesson.title);
        return {
          ...lesson,
          isCompleted,
          isLocked: false
        };
      }
      
      // ESCENARIO 2: Curso en progreso - lógica secuencial
      let isLocked = false;
      if (!isFirstInSequence && !isCompleted) {
        const currentIndex = orderedLessons.findIndex(l => l.id === lesson.id);
        if (currentIndex > 0) {
          const previousLesson = orderedLessons[currentIndex - 1];
          const previousProgress = lessonProgress.find(p => p.lesson_id === previousLesson.id);
          isLocked = !previousProgress?.is_completed;
        }
      }
      
      console.log('📚 Lesson state:', {
        title: lesson.title,
        isFirstInSequence,
        isCompleted,
        isLocked,
        isReviewMode
      });
      
      return {
        ...lesson,
        isCompleted,
        isLocked
      };
    });
  }, [lessonProgress, userProgress, podcast]);

  const findResumePoint = useCallback((lessons: Lesson[], courseId: string) => {
    console.log('🎯 Finding resume point for course:', courseId);
    
    const courseProgress = userProgress.find(p => p.course_id === courseId);
    const isReviewMode = courseProgress?.is_completed && courseProgress?.progress_percentage === 100;
    
    // CORREGIDO: Si el curso está 100% completo, NO auto-posicionar
    if (isReviewMode) {
      console.log('🏆 Course 100% complete - no auto-positioning in review mode');
      return null;
    }
    
    const orderedLessons = podcast ? getOrderedLessons(lessons, podcast.modules) : lessons;
    
    // ESTRATEGIA PRINCIPAL: Buscar la primera lección incompleta y desbloqueada (ícono ▶)
    const firstIncomplete = orderedLessons.find(lesson => 
      !lesson.isCompleted && !lesson.isLocked
    );
    
    if (firstIncomplete) {
      console.log('🎯 Resume point found: Next lesson to continue (▶) -', firstIncomplete.title);
      return firstIncomplete;
    }
    
    // VERIFICACIÓN: Si todas están completadas, no auto-posicionar
    const allCompleted = orderedLessons.every(lesson => lesson.isCompleted);
    if (allCompleted) {
      console.log('🏆 All lessons completed - no auto-positioning needed');
      return null;
    }
    
    // ÚLTIMO RECURSO: Solo si es la primera vez y no hay progreso
    const hasAnyProgress = lessonProgress.some(p => p.is_completed || (p.current_position && p.current_position > 5));
    if (!hasAnyProgress) {
      const firstLesson = getFirstLesson(lessons, podcast?.modules || []);
      if (firstLesson && !firstLesson.isLocked) {
        console.log('🎯 First time access - starting with first lesson:', firstLesson.title);
        return firstLesson;
      }
    }
    
    console.log('❌ No suitable resume point found');
    return null;
  }, [podcast, userProgress, lessonProgress]);

  const initializePodcastWithProgress = useCallback(() => {
    if (!podcast || !user) {
      console.log('❌ Cannot initialize: missing podcast or user');
      return;
    }

    console.log('🚀 INITIALIZING PODCAST WITH CORRECT SEQUENCE:', podcast.title);
    
    const updatedLessons = calculateLessonStates(podcast.lessons, podcast.id);
    const updatedPodcast = {
      ...podcast,
      lessons: updatedLessons
    };
    
    console.log('✅ Podcast updated with lesson states');
    setPodcast(updatedPodcast);
    hasInitialized.current = true;
  }, [podcast, user, calculateLessonStates, setPodcast]);

  const initializeCurrentLesson = useCallback(() => {
    if (!podcast || !podcast.lessons || podcast.lessons.length === 0) {
      console.log('❌ Cannot initialize current lesson: no lessons available');
      setCurrentLesson(null);
      return;
    }

    console.log('🎯 SMART AUTO-POSITIONING: Finding next lesson to continue...');
    
    // CORREGIDO: Buscar punto de continuación inteligente (ícono ▶)
    const resumeLesson = findResumePoint(podcast.lessons, podcast.id);
    
    if (resumeLesson) {
      console.log('🎯 Auto-positioned on next lesson to continue (▶):', resumeLesson.title, 'completed:', resumeLesson.isCompleted, 'locked:', resumeLesson.isLocked);
      setCurrentLesson(resumeLesson);
    } else {
      console.log('🏆 No auto-positioning needed - user can choose freely');
      setCurrentLesson(null);
    }
  }, [podcast, findResumePoint]);

  return {
    currentLesson,
    setCurrentLesson,
    initializePodcastWithProgress,
    initializeCurrentLesson,
    hasInitialized: hasInitialized.current
  };
}
