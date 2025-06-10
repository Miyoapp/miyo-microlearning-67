
import { Lesson, Module } from '@/types';

/**
 * Genera un array de lecciones ordenado siguiendo la secuencia real de la BD:
 * - Módulos ordenados por 'orden' ASC
 * - Dentro de cada módulo, lecciones ordenadas por 'orden' ASC
 */
export function getOrderedLessons(lessons: Lesson[], modules: Module[]): Lesson[] {
  console.log('📋 Generating ordered lessons based on DB sequence...');
  
  // Ordenar módulos por orden
  const sortedModules = [...modules].sort((a, b) => {
    // Extraer el orden del título del módulo o usar un orden predeterminado
    const orderA = extractModuleOrder(a);
    const orderB = extractModuleOrder(b);
    return orderA - orderB;
  });
  
  const orderedLessons: Lesson[] = [];
  
  // Para cada módulo ordenado, agregar sus lecciones en orden
  sortedModules.forEach(module => {
    console.log('📚 Processing module:', module.title);
    
    // Obtener lecciones de este módulo
    const moduleLessons = module.lessonIds
      .map(lessonId => lessons.find(lesson => lesson.id === lessonId))
      .filter((lesson): lesson is Lesson => lesson !== undefined);
    
    // Las lecciones ya deberían estar en orden según lessonIds del módulo
    orderedLessons.push(...moduleLessons);
    
    console.log(`📖 Added ${moduleLessons.length} lessons from module ${module.title}`);
  });
  
  console.log('✅ Final ordered lessons:', orderedLessons.map(l => l.title));
  return orderedLessons;
}

/**
 * Extrae el número de orden de un módulo (asumiendo formato "Módulo X" o similar)
 */
function extractModuleOrder(module: Module): number {
  // Buscar números en el título del módulo
  const match = module.title.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}

/**
 * Encuentra la primera lección real según el orden de la BD
 */
export function getFirstLesson(lessons: Lesson[], modules: Module[]): Lesson | null {
  const orderedLessons = getOrderedLessons(lessons, modules);
  const firstLesson = orderedLessons[0] || null;
  
  console.log('🥇 First lesson identified:', firstLesson?.title);
  return firstLesson;
}

/**
 * Encuentra la siguiente lección en el orden real de la BD
 */
export function getNextLesson(currentLesson: Lesson, lessons: Lesson[], modules: Module[]): Lesson | null {
  const orderedLessons = getOrderedLessons(lessons, modules);
  const currentIndex = orderedLessons.findIndex(lesson => lesson.id === currentLesson.id);
  
  if (currentIndex === -1) {
    console.log('❌ Current lesson not found in ordered list');
    return null;
  }
  
  const nextLesson = orderedLessons[currentIndex + 1] || null;
  console.log('⏭️ Next lesson:', nextLesson?.title || 'None (end of course)');
  
  return nextLesson;
}

/**
 * Verifica si una lección es la primera según el orden real
 */
export function isFirstLessonInSequence(lesson: Lesson, lessons: Lesson[], modules: Module[]): boolean {
  const firstLesson = getFirstLesson(lessons, modules);
  const isFirst = firstLesson?.id === lesson.id;
  
  console.log(`🔍 Checking if ${lesson.title} is first lesson:`, isFirst);
  return isFirst;
}

/**
 * Obtiene la posición real de una lección en la secuencia (1-based)
 */
export function getLessonPosition(lesson: Lesson, lessons: Lesson[], modules: Module[]): number {
  const orderedLessons = getOrderedLessons(lessons, modules);
  const position = orderedLessons.findIndex(l => l.id === lesson.id) + 1;
  
  console.log(`📍 Position of ${lesson.title}:`, position);
  return position;
}
