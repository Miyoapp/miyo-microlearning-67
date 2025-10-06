import { useMemo } from 'react';
import { shouldDisableBackdropFilter } from '@/utils/platformDetection';

export const useGlassEffect = () => {
  const disableBlur = useMemo(() => shouldDisableBackdropFilter(), []);
  
  return {
    glassClass: disableBlur ? 'glass-windows' : 'glass glass-with-blur',
    disableBlur
  };
};
