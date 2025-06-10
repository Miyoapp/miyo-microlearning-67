
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

  // CORREGIDO: Cálculo de estados usando orden real de la BD
  const calculateLessonStates = useCallback((lessons: Lesson[], courseId: string) => {
    console.log('🔧 Calculating lesson states with correct DB sequence for course:', courseId);
    
    const courseProgress = userProgress.find(p => p.course_id === courseId);
    const isReviewMode = courseProgress?.is_completed && courseProgress?.progress_percentage === 100;
    
    // CRÍTICO: Usar orden real de la BD
    const orderedLessons = podcast ? getOrderedLessons(lessons, podcast.modules) : lessons;
    
    return lessons.map((lesson) => {
      const progress = lessonProgress.find(p => p.lesson_id === lesson.id);
      const isCompleted = progress?.is_completed || false;
      
      // CRÍTICO: Verificar si es la primera lección usando orden real
      const isFirstInSequence = podcast ? isFirstLessonInSequence(lesson, lessons, podcast.modules) : false;
      
      // En modo revisión (100% completo), todas las lecciones están desbloqueadas
      if (isReviewMode) {
        return {
          ...lesson,
          isCompleted,
          isLocked: false
        };
      }
      
      // Para cursos en progreso:
      // - Primera lección: SIEMPRE desbloqueada
      // - Otras lecciones: desbloqueadas si la lección anterior está completada
      let isLocked = false;
      if (!isFirstInSequence) {
        // Encontrar la lección anterior en el orden real
        const currentIndex = orderedLessons.findIndex(l => l.id === lesson.id);
        if (currentIndex > 0) {
          const previousLesson = orderedLessons[currentIndex - 1];
          const previousProgress = lessonProgress.find(p => p.lesson_id === previousLesson.id);
          isLocked = !previousProgress?.is_completed;
        }
      }
      
      console.log('📚 Lesson state (real order):', {
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

  // CORREGIDO: Inicialización usando orden real
  const initializePodcastWithProgress = useCallback(() => {
    if (!podcast || !user) {
      console.log('❌ Cannot initialize: missing podcast or user');
      return;
    }

    console.log('🚀 INITIALIZING PODCAST WITH CORRECT SEQUENCE:', podcast.title);
    
    // Calcular estados usando orden real
    const updatedLessons = calculateLessonStates(podcast.lessons, podcast.id);
    
    // Actualizar podcast con estados calculados
    const updatedPodcast = {
      ...podcast,
      lessons: updatedLessons
    };
    
    console.log('✅ Podcast updated with correct lesson states');
    setPodcast(updatedPodcast);
    
    initializationRef.current = true;
  }, [podcast, user, calculateLessonStates, setPodcast]);

  // CORREGIDO: Inicialización de currentLesson usando primera lección real
  const initializeCurrentLesson = useCallback(() => {
    if (!podcast || !podcast.lessons || podcast.lessons.length === 0) {
      console.log('❌ Cannot initialize current lesson: no lessons available');
      setCurrentLesson(null);
      return;
    }

    console.log('🎯 INITIALIZING CURRENT LESSON WITH CORRECT SEQUENCE...');
    
    // CRÍTICO: Usar la primera lección real según orden de BD
    const firstLesson = getFirstLesson(podcast.lessons, podcast.modules);
    
    if (!firstLesson) {
      console.log('❌ No first lesson found');
      setCurrentLesson(null);
      return;
    }
    
    // Buscar primera lección incompleta o usar la primera lección
    const firstIncompleteLesson = podcast.lessons.find(lesson => !lesson.isCompleted && !lesson.isLocked);
    const targetLesson = firstIncompleteLesson || firstLesson;
    
    // CRÍTICO: La primera lección SIEMPRE debe estar desbloqueada
    const lessonToSet = {
      ...targetLesson,
      isLocked: firstLesson.id === targetLesson.id ? false : targetLesson.isLocked
    };
    
    console.log('🎯 Setting current lesson (first in real sequence):', lessonToSet.title, 'isLocked:', lessonToSet.isLocked);
    setCurrentLesson(lessonToSet);
  }, [podcast]);

  return {
    currentLesson,
    setCurrentLesson,
    initializePodcastWithProgress,
    initializeCurrentLesson
  };
}
