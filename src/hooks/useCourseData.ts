
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
