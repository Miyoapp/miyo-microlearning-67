
import { useMemo } from 'react';
import { Podcast } from '@/types';
import { useCoursePurchases } from '@/hooks/useCoursePurchases';

export function useCourseAccess(podcast: Podcast | null) {
  const { hasPurchased, refetch: refetchPurchases } = useCoursePurchases();
  
  const accessInfo = useMemo(() => {
    if (!podcast) {
      console.log('🔒 No podcast - default access granted');
      return { isPremium: false, hasAccess: true };
    }
    
    const isPremium = podcast.tipo_curso === 'pago';
    console.log('🔒 Course access check:', { 
      courseId: podcast.id, 
      isPremium, 
      courseType: podcast.tipo_curso 
    });
    
    // FIXED: For free courses, always grant access
    if (!isPremium) {
      console.log('✅ Free course - access granted');
      return { isPremium: false, hasAccess: true };
    }
    
    // For premium courses, check purchase status
    const hasAccess = hasPurchased(podcast.id);
    console.log('💰 Premium course access:', { hasAccess, courseId: podcast.id });
    
    return { isPremium, hasAccess };
  }, [podcast, hasPurchased]);

  return {
    ...accessInfo,
    refetchPurchases
  };
}
