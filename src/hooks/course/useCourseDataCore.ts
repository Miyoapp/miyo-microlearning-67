
import { useState } from 'react';
import { Podcast } from '@/types';
import { obtenerCursoPorId } from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";
import { createDefaultModules, initializeLessonsState } from '@/utils/courseDataHelpers';

export function useCourseDataCore(courseId: string | undefined) {
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  
  // Debug function for comprehensive logging
  const logDebugInfo = (action: string, details?: any) => {
    console.log(`🔄 [useCourseDataCore] ${action}:`, {
      courseId,
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
        
        // CORRECCIÓN CRÍTICA: Log inmediatamente antes y después de setPodcast
        console.log('🔧 [useCourseDataCore] ABOUT TO SET PODCAST:', {
          courseId,
          podcastTitle: podcastData.title,
          timestamp: new Date().toISOString()
        });
        
        setPodcast(podcastData);
        
        // CORRECCIÓN CRÍTICA: Verificar que el estado se estableció
        console.log('🔧 [useCourseDataCore] PODCAST STATE SET - Immediate verification:', {
          courseId,
          podcastTitle: podcastData.title,
          stateWasSet: true,
          timestamp: new Date().toISOString()
        });
        
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

  return {
    podcast,
    setPodcast,
    isLoading,
    error,
    retry,
    retryCount,
    cargarCurso,
    logDebugInfo
  };
}
