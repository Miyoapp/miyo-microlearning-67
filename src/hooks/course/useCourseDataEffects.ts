
import { useEffect, useRef } from 'react';
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
  
  // PREVENT RACE CONDITIONS: Track loading state
  const isLoadingRef = useRef(false);
  const lastLoadedCourseId = useRef<string | null>(null);

  // Main effect for course loading
  useEffect(() => {
    logDebugInfo('Effect triggered', {
      trigger: 'courseId/location/navigationType change',
      locationKey: location.key,
      state: location.state,
      pathname: location.pathname,
      navigationType,
      isCurrentlyLoading: isLoadingRef.current,
      lastLoadedCourseId: lastLoadedCourseId.current,
      courseId
    });
    
    // RACE CONDITION PREVENTION: Only load if not already loading and course changed
    if (!isLoadingRef.current && lastLoadedCourseId.current !== courseId) {
      isLoadingRef.current = true;
      lastLoadedCourseId.current = courseId;
      
      cargarCurso().finally(() => {
        isLoadingRef.current = false;
      });
    }
  }, [courseId, location.pathname, location.key, navigationType]);

  // Window focus listener for tab switching detection with debouncing
  useEffect(() => {
    let focusTimeout: NodeJS.Timeout;
    
    const handleFocus = () => {
      // DEBOUNCE: Clear any pending focus handlers
      if (focusTimeout) {
        clearTimeout(focusTimeout);
      }
      
      // DELAY: Wait a bit to avoid rapid successive calls
      focusTimeout = setTimeout(() => {
        logDebugInfo('Window focus detected - checking if refetch needed', {
          hasPodcast: !!podcast,
          hasError: !!error,
          currentCourseId: courseId,
          isCurrentlyLoading: isLoadingRef.current,
          lastLoadedCourseId: lastLoadedCourseId.current
        });
        
        // SMART REFETCH: Only refetch if we have an error, no data, or course changed
        const shouldRefetch = (error || !podcast) && 
                             courseId && 
                             !isLoadingRef.current &&
                             lastLoadedCourseId.current !== courseId;
        
        if (shouldRefetch) {
          logDebugInfo('Refetching due to window focus', {
            reason: error ? 'has error' : 'no podcast data'
          });
          isLoadingRef.current = true;
          lastLoadedCourseId.current = courseId;
          
          cargarCurso().finally(() => {
            isLoadingRef.current = false;
          });
        }
      }, 100); // 100ms debounce
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
      if (focusTimeout) {
        clearTimeout(focusTimeout);
      }
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [courseId, podcast, error]);

  // Popstate listener for back/forward navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      logDebugInfo('PopState event detected', {
        state: event.state,
        currentPath: location.pathname,
        isCurrentlyLoading: isLoadingRef.current
      });
      
      // PREVENT MULTIPLE LOADS: Only handle if not currently loading
      if (!isLoadingRef.current) {
        // Small delay to ensure location is updated
        setTimeout(() => {
          if (location.pathname.includes('/dashboard/course/') && courseId) {
            logDebugInfo('Refetching due to popstate navigation');
            isLoadingRef.current = true;
            lastLoadedCourseId.current = courseId;
            
            cargarCurso().finally(() => {
              isLoadingRef.current = false;
            });
          }
        }, 50);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [courseId, location.pathname]);
}
