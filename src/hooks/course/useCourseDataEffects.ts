
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
  
  // STEP 2: Simplified loading state tracking
  const isLoadingRef = useRef(false);
  const lastLoadedCourseId = useRef<string | null>(null);
  const hasAttemptedInitialLoad = useRef(false);

  // STEP 2: Force immediate initial load effect
  useEffect(() => {
    if (courseId && !hasAttemptedInitialLoad.current) {
      console.log('🚀 [useCourseDataEffects] FORCING IMMEDIATE INITIAL LOAD:', {
        courseId,
        timestamp: new Date().toISOString()
      });
      
      hasAttemptedInitialLoad.current = true;
      isLoadingRef.current = true;
      lastLoadedCourseId.current = courseId;
      
      cargarCurso().finally(() => {
        isLoadingRef.current = false;
      });
    }
  }, [courseId]); // Simplified dependency array

  // Main effect for course loading (simplified logic)
  useEffect(() => {
    logDebugInfo('Effect triggered', {
      trigger: 'courseId/location/navigationType change',
      locationKey: location.key,
      state: location.state,
      pathname: location.pathname,
      navigationType,
      isCurrentlyLoading: isLoadingRef.current,
      lastLoadedCourseId: lastLoadedCourseId.current,
      courseId,
      hasAttemptedInitialLoad: hasAttemptedInitialLoad.current
    });
    
    // STEP 2: Simplified condition - only prevent if actively loading the same course
    const shouldLoad = courseId && 
                      !isLoadingRef.current && 
                      lastLoadedCourseId.current !== courseId;
    
    if (shouldLoad) {
      console.log('🔄 [useCourseDataEffects] Loading course via effect:', courseId);
      isLoadingRef.current = true;
      lastLoadedCourseId.current = courseId;
      
      cargarCurso().finally(() => {
        isLoadingRef.current = false;
      });
    }
  }, [courseId, location.pathname, location.key, navigationType]);

  // OPTIMIZED FOCUS LISTENER: Reduced aggressiveness with better debouncing
  useEffect(() => {
    let focusTimeout: NodeJS.Timeout;
    let lastFocusTime = 0;
    
    const handleFocus = () => {
      const now = Date.now();
      
      // TAB SWITCH DETECTION: Enhanced logging
      console.log('🔄 TAB FOCUS EVENT DETECTED:', {
        timestamp: new Date().toISOString(),
        documentHidden: document.hidden,
        documentVisibilityState: document.visibilityState,
        timeSinceLastFocus: now - lastFocusTime,
        hasPodcast: !!podcast,
        hasError: !!error,
        courseId,
        isCurrentlyLoading: isLoadingRef.current,
        shouldConsiderRefetch: (now - lastFocusTime) > 5000 // Only if >5 seconds since last focus
      });
      
      // DEBOUNCE: Clear any pending focus handlers
      if (focusTimeout) {
        clearTimeout(focusTimeout);
      }
      
      // RATE LIMITING: Only handle focus if enough time has passed
      if (now - lastFocusTime < 5000) {
        console.log('🔄 Focus event ignored - too recent (rate limited)');
        return;
      }
      
      lastFocusTime = now;
      
      // EXTENDED DELAY: Wait longer to avoid rapid successive calls
      focusTimeout = setTimeout(() => {
        logDebugInfo('Window focus detected - checking if refetch needed', {
          hasPodcast: !!podcast,
          hasError: !!error,
          currentCourseId: courseId,
          isCurrentlyLoading: isLoadingRef.current,
          lastLoadedCourseId: lastLoadedCourseId.current,
          timeSinceLastFocus: Date.now() - lastFocusTime
        });
        
        // CONSERVATIVE REFETCH: Only refetch if we have a real problem
        const hasRealProblem = error && !podcast;
        const courseChanged = courseId && lastLoadedCourseId.current !== courseId;
        const shouldRefetch = (hasRealProblem || courseChanged) && 
                             courseId && 
                             !isLoadingRef.current;
        
        if (shouldRefetch) {
          logDebugInfo('Refetching due to window focus', {
            reason: hasRealProblem ? 'has error and no data' : 'course changed',
            hasError: !!error,
            hasPodcast: !!podcast
          });
          isLoadingRef.current = true;
          lastLoadedCourseId.current = courseId;
          
          cargarCurso().finally(() => {
            isLoadingRef.current = false;
          });
        } else {
          console.log('🔄 Focus refetch skipped - data is stable:', {
            hasPodcast: !!podcast,
            hasError: !!error,
            isLoading: isLoadingRef.current,
            reason: 'no real problem detected'
          });
        }
      }, 500); // Increased debounce to 500ms
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ TAB VISIBILITY CHANGE - Page became visible:', {
          timestamp: new Date().toISOString(),
          courseId,
          hasPodcast: !!podcast,
          hasError: !!error
        });
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
