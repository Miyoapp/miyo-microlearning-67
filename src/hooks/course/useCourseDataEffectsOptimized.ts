import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

interface UseCourseDataEffectsOptimizedProps {
  courseId: string | undefined;
  hasPodcast: boolean;
  hasError: boolean;
  refetchCourse: () => void;
}

/**
 * OPTIMIZED: Versión simplificada de efectos de curso
 * Reduce la agresividad de los refetch automáticos para mejor rendimiento
 */
export function useCourseDataEffectsOptimized({
  courseId,
  hasPodcast,
  hasError,
  refetchCourse
}: UseCourseDataEffectsOptimizedProps) {
  const location = useLocation();
  const navigationType = useNavigationType();
  
  // Track loading state to prevent race conditions
  const isLoadingRef = useRef(false);
  const lastLoadedCourseId = useRef<string | null>(null);

  // Main effect for course loading - SIMPLIFIED
  useEffect(() => {
    console.log('📊 OPTIMIZED EFFECTS: Course ID changed', {
      courseId,
      needsLoad: !hasPodcast && !hasError && courseId !== lastLoadedCourseId.current
    });
    
    // Only load if we don't have data and course changed
    if (!isLoadingRef.current && 
        !hasPodcast && 
        !hasError && 
        courseId && 
        courseId !== lastLoadedCourseId.current) {
      
      console.log('📊 OPTIMIZED: Loading course', courseId);
      isLoadingRef.current = true;
      lastLoadedCourseId.current = courseId;
      
      refetchCourse();
      
      // Reset loading flag after a reasonable timeout
      setTimeout(() => {
        isLoadingRef.current = false;
      }, 5000);
    }
  }, [courseId, hasPodcast, hasError]);

  // CONSERVATIVE FOCUS LISTENER: Only refetch on real errors
  useEffect(() => {
    let focusTimeout: NodeJS.Timeout;
    let lastFocusTime = 0;
    
    const handleFocus = () => {
      const now = Date.now();
      
      // Rate limiting - only handle focus every 10 seconds
      if (now - lastFocusTime < 10000) {
        return;
      }
      
      lastFocusTime = now;
      
      // Only refetch if we have a real problem
      if (hasError && !hasPodcast && courseId && !isLoadingRef.current) {
        console.log('📊 OPTIMIZED: Refetching on focus due to error');
        focusTimeout = setTimeout(() => {
          isLoadingRef.current = true;
          refetchCourse();
          setTimeout(() => {
            isLoadingRef.current = false;
          }, 5000);
        }, 1000);
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
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
  }, [courseId, hasPodcast, hasError]);
}