
import { Podcast } from '@/types';

// Helper functions for course data processing
export function createDefaultModules(podcast: Podcast) {
  console.log('📝 Creating default modules for:', podcast.title);
  return [
    {
      id: 'module-1',
      title: 'Conceptos Básicos',
      lessonIds: podcast.lessons.slice(0, 2).map(l => l.id)
    },
    {
      id: 'module-2',
      title: 'Técnicas Intermedias',
      lessonIds: podcast.lessons.slice(2, 4).map(l => l.id)
    },
    {
      id: 'module-3',
      title: 'Aplicación Práctica',
      lessonIds: podcast.lessons.slice(4).map(l => l.id)
    }
  ];
}

// Inicializar el estado de las lecciones (solo la primera lección del primer módulo desbloqueada)
export function initializeLessonsState(podcast: Podcast) {
  console.log('🎯 Initializing lessons state for:', podcast.title);
  
  // Si no hay módulos, devolver las lecciones tal cual
  if (!podcast.modules || podcast.modules.length === 0) {
    console.log('⚠️ No modules found, returning lessons as-is');
    return podcast.lessons;
  }
  
  // Obtener el ID de la primera lección del primer módulo
  const firstModule = podcast.modules[0];
  const firstLessonId = firstModule.lessonIds[0];
  
  console.log('🔓 First lesson ID to unlock:', firstLessonId);
  
  // Actualizar el estado de todas las lecciones
  return podcast.lessons.map(lesson => {
    if (lesson.id === firstLessonId) {
      // Primera lección del primer módulo desbloqueada
      return { ...lesson, isLocked: false, isCompleted: false };
    } else {
      // Resto de lecciones bloqueadas
      return { ...lesson, isLocked: true, isCompleted: false };
    }
  });
}
