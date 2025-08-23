
import { useState, useCallback } from 'react';

export function useTransitionState() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [preservedState, setPreservedState] = useState<{
    currentTime: number;
    duration: number;
  } | null>(null);

  const startTransition = useCallback((currentTime: number, duration: number) => {
    console.log('🔄 Starting audio transition, preserving state:', { currentTime, duration });
    setPreservedState({ currentTime, duration });
    setIsTransitioning(true);
  }, []);

  const endTransition = useCallback(() => {
    console.log('✅ Ending audio transition, clearing preserved state');
    setIsTransitioning(false);
    setPreservedState(null);
  }, []);

  return {
    isTransitioning,
    preservedState,
    startTransition,
    endTransition
  };
}
