import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';

interface PerformanceConfig {
  reduceAnimations: boolean;
  disableMotion: boolean;
  simplifyEffects: boolean;
  enableLazyLoading: boolean;
}

// Hook to manage performance optimizations based on device capabilities
export const usePerformanceOptimization = (): PerformanceConfig => {
  const isMobile = useIsMobile();
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);

  useEffect(() => {
    // Detect low-end devices - more conservative approach
    const checkDeviceCapabilities = () => {
      // Check memory (if available)
      const memory = (navigator as any).deviceMemory;
      const hardwareConcurrency = navigator.hardwareConcurrency || 2;
      
      // Only consider truly low-end devices
      const isLowEnd = (
        (memory && memory <= 1) || 
        (hardwareConcurrency <= 1 && window.innerWidth <= 360)
      );
      
      setIsLowEndDevice(isLowEnd);
    };

    checkDeviceCapabilities();
  }, [isMobile]);

  return {
    reduceAnimations: isMobile || isLowEndDevice,
    disableMotion: isLowEndDevice,
    simplifyEffects: isMobile,
    enableLazyLoading: true,
  };
};

// Utility to conditionally apply motion props
export const getMotionProps = (props: any, config: PerformanceConfig) => {
  if (config.disableMotion) {
    // Still show content immediately without animations
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      whileInView: { opacity: 1 },
      viewport: props.viewport || { once: true }
    };
  }
  
  if (config.reduceAnimations) {
    // Simplify animations for mobile
    return {
      ...props,
      transition: { duration: 0.2 },
      variants: props.variants ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
      } : undefined
    };
  }
  
  return props;
};