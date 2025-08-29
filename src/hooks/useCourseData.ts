
import { useEffect } from 'react';
import { useCourseDataCore } from './course/useCourseDataCore';
import { useCourseDataEffects } from './course/useCourseDataEffects';

export function useCourseData(courseId: string | undefined) {
  const {
    podcast,
    setPodcast,
    isLoading,
    error,
    retry,
    retryCount,
    cargarCurso,
    logDebugInfo
  } = useCourseDataCore(courseId);

  // STEP 1 DEBUG: Verify podcast propagation
  console.log('🔍 [useCourseData] State propagation check:', {
    courseId,
    podcastExists: !!podcast,
    podcastTitle: podcast?.title,
    isLoading,
    error,
    retryCount,
    timestamp: new Date().toISOString()
  });

  // CORRECCIÓN CRÍTICA: Verificar propagación de podcast cuando cambie
  useEffect(() => {
    console.log('🔧 [useCourseData] PODCAST STATE CHANGED - Propagation confirmed:', {
      courseId,
      podcastExists: !!podcast,
      podcastTitle: podcast?.title,
      isLoading,
      error,
      timestamp: new Date().toISOString(),
      propagationWorking: 'YES - State propagated successfully!'
    });
  }, [podcast]);

  // CORRECCIÓN CRÍTICA: Verificar isLoading cuando cambie
  useEffect(() => {
    console.log('🔧 [useCourseData] LOADING STATE CHANGED:', {
      courseId,
      isLoading,
      podcastExists: !!podcast,
      timestamp: new Date().toISOString()
    });
  }, [isLoading]);

  // Set up all the effects
  useCourseDataEffects({
    courseId,
    podcast,
    error,
    cargarCurso,
    logDebugInfo
  });

  return { 
    podcast, 
    setPodcast, 
    isLoading, 
    error,
    retry,
    retryCount
  };
}
