
import { useMemo } from 'react';
import { useCoursePurchases } from '@/hooks/useCoursePurchases';
import { Podcast } from '@/types';

export function useCourseAccess(podcast: Podcast | null) {
  const { hasPurchased } = useCoursePurchases();

  const accessInfo = useMemo(() => {
    if (!podcast) {
      return {
        isPremium: false,
        hasAccess: false
      };
    }

    const isPremium = podcast.tipo_curso === 'pago';
    const hasAccess = !isPremium || hasPurchased(podcast.id);

    return {
      isPremium,
      hasAccess
    };
  }, [podcast, hasPurchased]);

  return accessInfo;
}
