
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
