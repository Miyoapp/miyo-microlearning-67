
import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { Podcast } from '@/types';

interface UseCourseDataEffectsProps {
  courseId: string | undefined;
  podcast: Podcast | null;
  error: string | null;
  cargarCurso: (retryAttempt?: number) => Promise<void>;
  logDebugInfo: (action: string, details?: any) => void;
}

export function useCourseDataEffects({
  courseId,
  podcast,
  error,
  cargarCurso,
  logDebugInfo
}: UseCourseDataEffectsProps) {
  const location = useLocation();
  const navigationType = useNavigationType();

  // Main effect for course loading
  useEffect(() => {
    logDebugInfo('Effect triggered', {
      trigger: 'courseId/location/navigationType change',
      locationKey: location.key,
      state: location.state,
      pathname: location.pathname,
      navigationType
    });
    
    cargarCurso();
  }, [courseId, location.pathname, location.key, navigationType]);

  // Window focus listener for tab switching detection
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

  // Popstate listener for back/forward navigation
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
}
