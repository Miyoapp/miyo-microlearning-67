
import { useState, useEffect } from 'react';
import { Podcast } from '@/types';
import { obtenerCursoPorId } from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";

export function useCourseData(courseId: string | undefined) {
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const cargarCurso = async () => {
      if (!courseId) {
        console.log('❌ No courseId provided');
        setIsLoading(false);
        return;
      }
      
      try {
        console.log('🔄 Loading course with ID:', courseId);
        setIsLoading(true);
        
        const podcastData = await obtenerCursoPorId(courseId);
        console.log('📚 Course data received:', podcastData ? 'Success' : 'No data');
        
        if (podcastData) {
          // Generate modules if they don't exist
          if (!podcastData.modules || podcastData.modules.length === 0) {
            console.log('🔧 Generating default modules');
            const defaultModules = createDefaultModules(podcastData);
            podcastData.modules = defaultModules;
          }
          
          // Asegurar que todas las lecciones tengan el estado correcto
          const updatedLessons = initializeLessonsState(podcastData);
          podcastData.lessons = updatedLessons;
          
          console.log('✅ Course loaded successfully:', podcastData.title);
          setPodcast(podcastData);
        } else {
          console.log('❌ No course data found for ID:', courseId);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("❌ Error loading course:", error);
        toast({
          title: "Error al cargar curso",
          description: "No se pudo cargar el curso solicitado. Por favor, intenta de nuevo.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };
    
    cargarCurso();
  }, [courseId, toast]);

  return { podcast, setPodcast, isLoading };
}

// Helper functions
function createDefaultModules(podcast: Podcast) {
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
function initializeLessonsState(podcast: Podcast) {
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
