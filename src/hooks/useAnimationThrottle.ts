import { useEffect, useRef } from 'react';

let activeAnimations = 0;
const MAX_CONCURRENT_ANIMATIONS = 5; // Maximum 5 animations simultaneously

/**
 * Hook to throttle concurrent animations for better performance
 * Prevents too many animations from running at the same time
 */
export const useAnimationThrottle = (shouldAnimate: boolean) => {
  const hasSlot = useRef(false);

  useEffect(() => {
    if (shouldAnimate && activeAnimations < MAX_CONCURRENT_ANIMATIONS) {
      activeAnimations++;
      hasSlot.current = true;

      return () => {
        if (hasSlot.current) {
          activeAnimations--;
          hasSlot.current = false;
        }
      };
    }
  }, [shouldAnimate]);

  return hasSlot.current && shouldAnimate;
};
