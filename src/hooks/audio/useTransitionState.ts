
import { useState, useCallback } from 'react';

export function useTransitionState() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [preservedState, setPreservedState] = useState<{
    currentTime: number;
    duration: number;
    lessonId: string;
  } | null>(null);

  const startTransition = useCallback((currentTime: number, duration: number, lessonId: string) => {
    console.log('🔄 Starting audio transition, preserving state:', { currentTime, duration, lessonId });
    setPreservedState({ currentTime, duration, lessonId });
    setIsTransitioning(true);
  }, []);

  const endTransition = useCallback(() => {
    console.log('✅ Ending audio transition, clearing preserved state');
    setIsTransitioning(false);
    setPreservedState(null);
  }, []);

  const shouldPreserveState = useCallback((lessonId: string) => {
    return isTransitioning && preservedState?.lessonId === lessonId;
  }, [isTransitioning, preservedState]);

  return {
    isTransitioning,
    preservedState,
    startTransition,
    endTransition,
    shouldPreserveState
  };
}
