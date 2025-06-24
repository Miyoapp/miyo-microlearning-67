
import { useState, useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { Podcast } from '@/types';
import { obtenerCursoPorId } from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";

export function useCourseData(courseId: string | undefined) {
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  const location = useLocation();
  const navigationType = useNavigationType();
  
  // Debug function for comprehensive logging
  const logDebugInfo = (action: string, details?: any) => {
    console.log(`🔄 [useCourseData] ${action}:`, {
      courseId,
      pathname: location.pathname,
      navigationType,
      retryCount,
      timestamp: new Date().toISOString(),
      ...details
    });
  };

  const cargarCurso = async (retryAttempt = 0) => {
    if (!courseId) {
      logDebugInfo('No courseId provided, skipping fetch');
      setIsLoading(false);
      setError(null);
      return;
    }
    
    try {
      logDebugInfo('Starting course fetch', { retryAttempt });
      setIsLoading(true);
      setError(null);
      
      const podcastData = await obtenerCursoPorId(courseId);
      logDebugInfo('Course fetch completed', { 
        success: !!podcastData,
        courseTitle: podcastData?.title 
      });
      
      if (podcastData) {
        // Generate modules if they don't exist
        if (!podcastData.modules || podcastData.modules.length === 0) {
          logDebugInfo('Generating default modules');
          const defaultModules = createDefaultModules(podcastData);
          podcastData.modules = defaultModules;
        }
        
        // Asegurar que todas las lecciones tengan el estado correcto
        const updatedLessons = initializeLessonsState(podcastData);
        podcastData.lessons = updatedLessons;
        
        logDebugInfo('Course loaded successfully', { courseTitle: podcastData.title });
        setPodcast(podcastData);
        setRetryCount(0);
      } else {
        const errorMsg = `No course data found for ID: ${courseId}`;
        logDebugInfo('Course not found', { courseId });
        setError(errorMsg);
      }
      
      setIsLoading(false);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      logDebugInfo('Course fetch failed', { error: errorMsg, retryAttempt });
      console.error("❌ Error loading course:", error);
      
      setError(errorMsg);
      setIsLoading(false);
      
      if (retryAttempt === 0) {
        toast({
          title: "Error al cargar curso",
          description: "No se pudo cargar el curso. Puedes intentar de nuevo.",
          variant: "destructive"
        });
      }
    }
  };

  const retry = () => {
    const newRetryCount = retryCount + 1;
    logDebugInfo('Manual retry triggered', { retryCount: newRetryCount });
    setRetryCount(newRetryCount);
    cargarCurso(newRetryCount);
  };

  useEffect(() => {
    logDebugInfo('Effect triggered', {
      trigger: 'courseId/location/navigationType change',
      locationKey: location.key,
      state: location.state
    });
    
    cargarCurso();
  }, [courseId, location.pathname, location.key, navigationType]);

  // Add window focus listener for tab switching detection
  useEffect(() => {
    const handleFocus = () => {
      logDebugInfo('Window focus detected - checking if refetch needed', {
        hasPodcast: !!podcast,
        hasError: !!error,
        currentCourseId: courseId
      });
      
      // Refetch if we have an error or no data
      if ((error || !podcast) && courseId) {
        logDebugInfo('Refetching due to window focus');
        cargarCurso();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        logDebugInfo('Page became visible - checking if refetch needed');
        handleFocus();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [courseId, podcast, error]);

  // Add popstate listener for back/forward navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      logDebugInfo('PopState event detected', {
        state: event.state,
        currentPath: location.pathname
      });
      
      // Small delay to ensure location is updated
      setTimeout(() => {
        if (location.pathname.includes('/dashboard/course/') && courseId) {
          logDebugInfo('Refetching due to popstate navigation');
          cargarCurso();
        }
      }, 50);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [courseId, location.pathname]);

  return { 
    podcast, 
    setPodcast, 
    isLoading, 
    error,
    retry,
    retryCount
  };
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
