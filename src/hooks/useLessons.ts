
import { useState } from 'react';
import { Podcast, Lesson } from '@/types';
import { useToast } from "@/components/ui/use-toast";

export function useLessons(podcast: Podcast | null, setPodcast: (podcast: Podcast) => void) {
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  // Initialize with first available lesson
  const initializeCurrentLesson = () => {
    if (!podcast) return;
    const firstLesson = getFirstAvailableLesson(podcast);
    if (firstLesson) {
      setCurrentLesson(firstLesson);
    }
  };

  // Handle selecting a lesson
  const handleSelectLesson = (lesson: Lesson) => {
    if (lesson.isLocked) {
      toast({
        title: "Lección bloqueada",
        description: "Completa las lecciones anteriores para desbloquear esta.",
        variant: "default"
      });
      return;
    }
    
    setCurrentLesson(lesson);
    // Iniciar reproducción automáticamente al seleccionar desde la ruta de aprendizaje
    setIsPlaying(true);
  };

  // Get the next lesson in sequence (used for autoplay and navigation)
  const getNextLesson = (currentLessonId: string): Lesson | null => {
    if (!podcast) return null;
    
    // Encontrar todos los IDs de lecciones desbloqueadas en el orden correcto de los módulos
    const allAvailableLessons: Lesson[] = [];
    podcast.modules.forEach(module => {
      module.lessonIds.forEach(lessonId => {
        const lesson = podcast.lessons.find(l => l.id === lessonId);
        if (lesson && !lesson.isLocked) {
          allAvailableLessons.push(lesson);
        }
      });
    });

    // Encontrar el índice de la lección actual
    const currentIndex = allAvailableLessons.findIndex(lesson => lesson.id === currentLessonId);
    
    // Si encontramos la lección actual y hay una siguiente disponible
    if (currentIndex !== -1 && currentIndex < allAvailableLessons.length - 1) {
      return allAvailableLessons[currentIndex + 1];
    }
    
    return null;
  };

  // Handle toggling play state
  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle lesson completion
  const handleLessonComplete = () => {
    if (!podcast || !currentLesson) return;
    
    // Crear una copia de las lecciones para modificar
    const updatedLessons = [...podcast.lessons];
    const modules = [...podcast.modules];
    
    // Encontrar el módulo actual y el índice de la lección actual dentro de ese módulo
    const currentModuleIndex = modules.findIndex(module => 
      module.lessonIds.includes(currentLesson.id)
    );
    
    if (currentModuleIndex === -1) return;
    
    const currentModule = modules[currentModuleIndex];
    const currentLessonIndexInModule = currentModule.lessonIds.indexOf(currentLesson.id);
    
    // Marcar la lección actual como completada
    const lessonIndex = updatedLessons.findIndex(l => l.id === currentLesson.id);
    if (lessonIndex !== -1) {
      updatedLessons[lessonIndex] = { ...updatedLessons[lessonIndex], isCompleted: true };
    }
    
    // Determinar qué lección desbloquear a continuación
    let nextLessonToUnlock: string | null = null;
    let unlockDescription = "";
    
    // Si hay más lecciones en el módulo actual
    if (currentLessonIndexInModule < currentModule.lessonIds.length - 1) {
      // Desbloquear la siguiente lección del mismo módulo
      nextLessonToUnlock = currentModule.lessonIds[currentLessonIndexInModule + 1];
      unlockDescription = "La siguiente lección ha sido desbloqueada.";
    } else {
      // Si es la última lección del módulo actual y hay más módulos
      if (currentModuleIndex < modules.length - 1) {
        // Verificar si todas las lecciones del módulo actual están completadas
        const allLessonsInModuleCompleted = currentModule.lessonIds.every(lessonId => {
          const lesson = updatedLessons.find(l => l.id === lessonId);
          return lesson && (lesson.id === currentLesson.id || lesson.isCompleted);
        });
        
        if (allLessonsInModuleCompleted) {
          // Desbloquear la primera lección del siguiente módulo
          const nextModule = modules[currentModuleIndex + 1];
          nextLessonToUnlock = nextModule.lessonIds[0];
          unlockDescription = "¡Módulo completado! La primera lección del siguiente módulo ha sido desbloqueada.";
        }
      } else {
        // Era la última lección del último módulo
        unlockDescription = "¡Has completado todas las lecciones del curso!";
      }
    }
    
    // Desbloquear la siguiente lección si corresponde
    if (nextLessonToUnlock) {
      const nextLessonIndex = updatedLessons.findIndex(l => l.id === nextLessonToUnlock);
      if (nextLessonIndex !== -1) {
        updatedLessons[nextLessonIndex] = { ...updatedLessons[nextLessonIndex], isLocked: false };
      }
    }
    
    // Actualizar el podcast con las nuevas lecciones
    setPodcast({ ...podcast, lessons: updatedLessons });
    
    // Notificar al usuario
    toast({
      title: "¡Lección completada!",
      description: unlockDescription,
      variant: "default"
    });
    
    // Avanzar a la siguiente lección disponible
    const nextLesson = getNextLesson(currentLesson.id);
    if (nextLesson) {
      setCurrentLesson(nextLesson);
      // Mantener el estado de reproducción
      setIsPlaying(true);
    }
  };

  return {
    currentLesson,
    setCurrentLesson,
    isPlaying,
    setIsPlaying,
    initializeCurrentLesson,
    handleSelectLesson,
    handleTogglePlay,
    handleLessonComplete,
    getNextLesson
  };
}

// Helper function to get first available lesson
function getFirstAvailableLesson(podcast: Podcast): Lesson | null {
  return podcast.lessons.find(lesson => !lesson.isLocked) || null;
}
