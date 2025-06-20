
import { useMemo } from 'react';
import { Podcast } from '@/types';
import { useCoursePurchases } from '@/hooks/useCoursePurchases';

export function useCourseAccess(podcast: Podcast | null) {
  const { hasPurchased, refetch: refetchPurchases, loading } = useCoursePurchases();
  
  const accessInfo = useMemo(() => {
    console.log('🔒 COURSE ACCESS CALCULATION - START');
    
    if (!podcast) {
      console.log('🔒 No podcast - default access granted');
      return { isPremium: false, hasAccess: true, isLoading: loading };
    }
    
    const isPremium = podcast.tipo_curso === 'pago';
    console.log('🔒 Course access details:', { 
      courseId: podcast.id, 
      courseTitle: podcast.title,
      courseType: podcast.tipo_curso,
      isPremium,
      precio: podcast.precio,
      purchasesLoading: loading
    });
    
    // CRITICAL FIX: For free courses, ALWAYS grant access
    if (!isPremium) {
      console.log('✅ FREE COURSE - ACCESS GRANTED');
      return { isPremium: false, hasAccess: true, isLoading: false };
    }
    
    // For premium courses, check purchase status
    const hasAccess = hasPurchased(podcast.id);
    console.log('💰 PREMIUM COURSE ACCESS CHECK:', { 
      hasAccess, 
      courseId: podcast.id,
      courseTitle: podcast.title,
      userHasPurchased: hasAccess,
      purchasesStillLoading: loading
    });
    
    return { isPremium, hasAccess, isLoading: loading };
  }, [podcast, hasPurchased, loading]);

  console.log('🔒 FINAL ACCESS RESULT:', {
    courseId: podcast?.id,
    courseTitle: podcast?.title,
    isPremium: accessInfo.isPremium,
    hasAccess: accessInfo.hasAccess,
    isLoading: accessInfo.isLoading
  });

  return {
    ...accessInfo,
    refetchPurchases
  };
}
