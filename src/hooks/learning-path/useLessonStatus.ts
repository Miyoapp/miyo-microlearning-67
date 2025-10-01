import { useMemo } from 'react';
import { Lesson, Module } from '@/types';

interface LessonStatus {
  isCompleted: boolean;
  isLocked: boolean;
  isCurrent: boolean;
  canPlay: boolean;
  isFirstInSequence: boolean;
  position: number;
  nextLessonId?: string;
  previousLessonId?: string;
  _hash: string;
}

// Utility functions
function getOrderedLessons(lessons: Lesson[], modules: Module[]): Lesson[] {
  const orderedLessons: Lesson[] = [];
  
  modules.forEach(module => {
    const lessonIds = Array.isArray((module as any).lessonIds) ? (module as any).lessonIds : [];
    lessonIds.forEach((lessonId: string) => {
      const lesson = lessons.find(l => l.id === lessonId);
      if (lesson) {
        orderedLessons.push(lesson);
      }
    });
  });
  
  return orderedLessons;
}

// FUNCIÓN CLAVE: Determina qué lecciones deben estar desbloqueadas
function calculateUnlockedLessons(orderedLessons: Lesson[]): Set<string> {
  const unlockedIds = new Set<string>();
  
  // La primera lección siempre está desbloqueada
  if (orderedLessons.length > 0) {
    unlockedIds.add(orderedLessons[0].id);
  }
  
  // Desbloquear lecciones basándose en completación secuencial
  for (let i = 0; i < orderedLessons.length - 1; i++) {
    const currentLesson = orderedLessons[i];
    const nextLesson = orderedLessons[i + 1];
    
    // Si la lección actual está completada, desbloquear la siguiente
    if (currentLesson.isCompleted) {
      unlockedIds.add(nextLesson.id);
    } else {
      // Si encontramos una lección no completada, detener el desbloqueo
      break;
    }
  }
  
  return unlockedIds;
}

export function useLessonStatus(
  lessons: Lesson[], 
  modules: Module[], 
  currentLessonId: string | null,
  lessonProgress?: any[] // Progreso desde la base de datos
): Map<string, LessonStatus> {
  return useMemo(() => {
    // Normalize inputs to safe arrays
    const safeLessons = Array.isArray(lessons) ? lessons : [];
    const safeModules = Array.isArray(modules) ? modules : [];
    
    const lessonStatusMap = new Map<string, LessonStatus>();
    const orderedLessons = getOrderedLessons(safeLessons, safeModules);
    
    // Crear mapa de progreso para acceso rápido
    const progressMap = new Map();
    if (lessonProgress) {
      lessonProgress.forEach(progress => {
        progressMap.set(progress.lesson_id, progress);
      });
    }
    
    // Crear lecciones enriquecidas con progreso de DB
    const enrichedLessons = safeLessons.map(lesson => {
      const dbProgress = progressMap.get(lesson.id);
      return {
        ...lesson,
        isCompleted: dbProgress?.is_completed || lesson.isCompleted || false,
        currentPosition: dbProgress?.current_position || 0
      };
    });
    
    // Recalcular lecciones desbloqueadas basándose en progreso real
    const enrichedOrderedLessons = getOrderedLessons(enrichedLessons, safeModules);
    const unlockedLessonIds = calculateUnlockedLessons(enrichedOrderedLessons);
    
    console.log('🔍 Recalculating lesson status:');
    console.log('📚 Completed lessons:', enrichedLessons.filter(l => l.isCompleted).map(l => l.title));
    console.log('🔓 Unlocked lessons:', Array.from(unlockedLessonIds));
    
    // Crear mapa de posiciones
    const positionMap = new Map<string, number>();
    enrichedOrderedLessons.forEach((lesson, index) => {
      positionMap.set(lesson.id, index);
    });
    
    // Procesar cada lección
    enrichedLessons.forEach(lesson => {
      const position = positionMap.get(lesson.id) ?? -1;
      const isCompleted = lesson.isCompleted;
      const isCurrent = lesson.id === currentLessonId;
      const isFirstInSequence = position === 0;
      
      // LÓGICA CORREGIDA: Una lección está desbloqueada si:
      // 1. Es la primera lección, O
      // 2. Está completada, O  
      // 3. Está en la lista de lecciones desbloqueadas (secuencia completada)
      const isUnlocked = unlockedLessonIds.has(lesson.id) || isCompleted;
      
      // LÓGICA CORREGIDA: Una lección puede reproducirse si:
      // 1. Está desbloqueada, O
      // 2. Es la lección actual (para permitir pausa/resume)
      const canPlay = isUnlocked || isCurrent;
      
      // Navegación
      const nextLessonId = position >= 0 && position < enrichedOrderedLessons.length - 1 
        ? enrichedOrderedLessons[position + 1]?.id 
        : undefined;
      
      const previousLessonId = position > 0 
        ? enrichedOrderedLessons[position - 1]?.id 
        : undefined;
      
      const status: LessonStatus = {
        isCompleted,
        isLocked: !isUnlocked, // Invertir la lógica de desbloqueo
        isCurrent,
        canPlay,
        isFirstInSequence,
        position,
        nextLessonId,
        previousLessonId,
        _hash: `${isCompleted}-${!isUnlocked}-${isCurrent}-${canPlay}-${isFirstInSequence}-${position}`
      };
      
      // Logging mejorado
      const statusEmoji = isCompleted ? '✅' : (isUnlocked ? '🔓' : '🔒');
      const playEmoji = canPlay ? '▶️' : '⏸️';
      console.log(`${statusEmoji} ${playEmoji} [${position + 1}] ${lesson.title}`);
      
      lessonStatusMap.set(lesson.id, status);
    });
    
    return lessonStatusMap;
  }, [
    // Dependencias estabilizadas
    Array.isArray(lessons) ? lessons.map(l => `${l.id}:${l.isCompleted}:${l.isLocked}`).join('|') : '',
    Array.isArray(modules) ? modules.map(m => `${m.id}:${Array.isArray((m as any).lessonIds) ? (m as any).lessonIds.join(',') : ''}`).join('|') : '',
    currentLessonId,
    // Incluir progreso de DB en dependencias
    lessonProgress?.map(p => `${p.lesson_id}:${p.is_completed}:${p.current_position}`).join('|')
  ]);
}