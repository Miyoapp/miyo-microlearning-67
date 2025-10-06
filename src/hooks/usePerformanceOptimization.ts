import { useState, useEffect, useMemo } from 'react';
import { useIsMobile } from './use-mobile';
import { isWindows } from '@/utils/platformDetection';

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
  const isWindowsOS = useMemo(() => isWindows(), []);

  useEffect(() => {
    // Detect low-end devices - more conservative approach for Windows
    const checkDeviceCapabilities = () => {
      // Check memory (if available)
      const memory = (navigator as any).deviceMemory;
      const hardwareConcurrency = navigator.hardwareConcurrency || 2;
      
      // Consider low-end devices AND Windows for animations
      const isLowEnd = (
        (memory && memory <= 2) || // Increased threshold for safety
        (hardwareConcurrency <= 2) || // More conservative
        isWindowsOS // Treat Windows as requiring optimization
      );
      
      setIsLowEndDevice(isLowEnd);
    };

    checkDeviceCapabilities();
  }, [isMobile, isWindowsOS]);

  return {
    reduceAnimations: isMobile || isLowEndDevice,
    disableMotion: isLowEndDevice || isWindowsOS, // Disable motion on Windows
    simplifyEffects: isMobile || isWindowsOS, // Simplify effects on Windows
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