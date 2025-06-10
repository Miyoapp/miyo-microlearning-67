
import { useMemo } from 'react';
import { Podcast } from '@/types';
import { useCoursePurchases } from '@/hooks/useCoursePurchases';

export function useCourseAccess(podcast: Podcast | null) {
  const { hasPurchased, refetch: refetchPurchases } = useCoursePurchases();
  
  const accessInfo = useMemo(() => {
    if (!podcast) return { isPremium: false, hasAccess: true };
    
    const isPremium = podcast.tipo_curso === 'pago';
    const hasAccess = !isPremium || hasPurchased(podcast.id);
    
    return { isPremium, hasAccess };
  }, [podcast, hasPurchased]);

  return {
    ...accessInfo,
    refetchPurchases
  };
}
