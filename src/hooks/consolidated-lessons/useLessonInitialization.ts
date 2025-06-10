
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
  const initializationRef = useRef(false);

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
    initializationRef.current = true;
  }, [podcast, user, calculateLessonStates, setPodcast]);

  const initializeCurrentLesson = useCallback(() => {
    if (!podcast || !podcast.lessons || podcast.lessons.length === 0) {
      console.log('❌ Cannot initialize current lesson: no lessons available');
      setCurrentLesson(null);
      return;
    }

    console.log('🎯 INITIALIZING CURRENT LESSON...');
    
    const firstLesson = getFirstLesson(podcast.lessons, podcast.modules);
    if (!firstLesson) {
      console.log('❌ No first lesson found');
      setCurrentLesson(null);
      return;
    }
    
    // PRIORIDAD: Buscar primera lección incompleta y desbloqueada
    const firstIncompleteLesson = podcast.lessons.find(lesson => 
      !lesson.isCompleted && !lesson.isLocked
    );
    
    // FALLBACK: Usar primera lección si no hay incompletas disponibles
    const targetLesson = firstIncompleteLesson || firstLesson;
    
    // PROTECCIÓN: La primera lección siempre debe estar desbloqueada
    const lessonToSet = {
      ...targetLesson,
      isLocked: firstLesson.id === targetLesson.id ? false : targetLesson.isLocked
    };
    
    console.log('🎯 Setting current lesson:', lessonToSet.title, 'completed:', lessonToSet.isCompleted, 'locked:', lessonToSet.isLocked);
    setCurrentLesson(lessonToSet);
  }, [podcast]);

  return {
    currentLesson,
    setCurrentLesson,
    initializePodcastWithProgress,
    initializeCurrentLesson
  };
}
