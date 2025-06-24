
import { useMemo } from 'react';
import { Podcast } from '@/types';
import { useCoursePurchases } from '@/hooks/useCoursePurchases';

export function useCourseAccess(podcast: Podcast | null) {
  const { hasPurchased, refetch: refetchPurchases, loading, error: purchaseError } = useCoursePurchases();
  
  const accessInfo = useMemo(() => {
    console.log('🔒 COURSE ACCESS CALCULATION - START');
    
    if (!podcast) {
      console.log('🔒 No podcast - default access granted');
      return { 
        isPremium: false, 
        hasAccess: true, 
        isLoading: loading,
        error: null
      };
    }
    
    const isPremium = podcast.tipo_curso === 'pago';
    console.log('🔒 Course access details:', { 
      courseId: podcast.id, 
      courseTitle: podcast.title,
      courseType: podcast.tipo_curso,
      isPremium,
      precio: podcast.precio,
      purchasesLoading: loading,
      purchaseError: purchaseError
    });
    
    // CRITICAL FIX: For free courses, ALWAYS grant access regardless of loading state
    if (!isPremium) {
      console.log('✅ FREE COURSE - ACCESS ALWAYS GRANTED (stable access for free courses)');
      return { 
        isPremium: false, 
        hasAccess: true, 
        isLoading: false, // Never loading for free courses
        error: null
      };
    }
    
    // For premium courses, check purchase status
    const hasAccess = hasPurchased(podcast.id);
    console.log('💰 PREMIUM COURSE ACCESS CHECK:', { 
      hasAccess, 
      courseId: podcast.id,
      courseTitle: podcast.title,
      userHasPurchased: hasAccess,
      purchasesStillLoading: loading,
      purchaseError: purchaseError,
      stableAccessForPremium: hasAccess ? 'granted' : 'denied'
    });
    
    return { 
      isPremium, 
      hasAccess, 
      isLoading: loading,
      error: purchaseError
    };
  }, [podcast, hasPurchased, loading, purchaseError]);

  console.log('🔒 FINAL ACCESS RESULT:', {
    courseId: podcast?.id,
    courseTitle: podcast?.title,
    isPremium: accessInfo.isPremium,
    hasAccess: accessInfo.hasAccess,
    isLoading: accessInfo.isLoading,
    error: accessInfo.error,
    stableAccessGuaranteed: !accessInfo.isPremium || accessInfo.hasAccess
  });

  return {
    ...accessInfo,
    refetchPurchases
  };
}
