
import { useMemo } from 'react';
import { Podcast } from '@/types';
import { useCoursePurchases } from '@/hooks/useCoursePurchases';

export function useCourseAccess(podcast: Podcast | null) {
  const { hasPurchased, refetch: refetchPurchases, loading, error: purchaseError } = useCoursePurchases();
  
  const accessInfo = useMemo(() => {
    console.log('🔒 COURSE ACCESS CALCULATION - TAB SWITCH SAFE:', {
      timestamp: new Date().toISOString(),
      documentHidden: document.hidden,
      podcastExists: !!podcast,
      courseId: podcast?.id,
      courseTitle: podcast?.title
    });
    
    if (!podcast) {
      console.log('🔒 No podcast - default access granted (stable fallback)');
      return { 
        isPremium: false, 
        hasAccess: true, 
        isLoading: false, // Never loading when no podcast
        error: null
      };
    }
    
    const isPremium = podcast.tipo_curso === 'pago';
    console.log('🔒 Course access details (tab-switch resilient):', { 
      courseId: podcast.id, 
      courseTitle: podcast.title,
      courseType: podcast.tipo_curso,
      isPremium,
      precio: podcast.precio,
      purchasesLoading: loading,
      purchaseError: purchaseError,
      documentVisibility: document.visibilityState
    });
    
    // GUARANTEED STABILITY: For free courses, ALWAYS grant access with zero loading
    if (!isPremium) {
      console.log('✅ FREE COURSE - GUARANTEED STABLE ACCESS (tab-switch proof):', {
        courseTitle: podcast.title,
        accessAlwaysGranted: true,
        neverLoading: true,
        tabSwitchSafe: true
      });
      return { 
        isPremium: false, 
        hasAccess: true, 
        isLoading: false, // Absolutely never loading for free courses
        error: null
      };
    }
    
    // For premium courses, check purchase status with tab-switch awareness
    const hasAccess = hasPurchased(podcast.id);
    console.log('💰 PREMIUM COURSE ACCESS CHECK (tab-switch aware):', { 
      hasAccess, 
      courseId: podcast.id,
      courseTitle: podcast.title,
      userHasPurchased: hasAccess,
      purchasesStillLoading: loading,
      purchaseError: purchaseError,
      tabSwitchStableAccess: hasAccess ? 'GRANTED' : 'REQUIRES_PURCHASE',
      documentVisibility: document.visibilityState
    });
    
    return { 
      isPremium, 
      hasAccess, 
      isLoading: loading,
      error: purchaseError
    };
  }, [podcast, hasPurchased, loading, purchaseError]);

  console.log('🔒 FINAL ACCESS RESULT (TAB SWITCH SAFE):', {
    courseId: podcast?.id,
    courseTitle: podcast?.title,
    isPremium: accessInfo.isPremium,
    hasAccess: accessInfo.hasAccess,
    isLoading: accessInfo.isLoading,
    error: accessInfo.error,
    tabSwitchGuarantee: !accessInfo.isPremium ? 'FREE_ALWAYS_ACCESSIBLE' : (accessInfo.hasAccess ? 'PURCHASED_STABLE' : 'NEEDS_PURCHASE'),
    documentVisibility: document.visibilityState
  });

  return {
    ...accessInfo,
    refetchPurchases
  };
}
