
import { useEffect, useRef } from 'react';
import { useRealtimeProgress } from '@/hooks/useRealtimeProgress';
import { Podcast } from '@/types';

interface UseCourseRealtimeSyncProps {
  podcast: Podcast | null;
  initializePodcastWithProgress: () => void;
  refetch: () => void;
}

export function useCourseRealtimeSync({
  podcast,
  initializePodcastWithProgress,
  refetch
}: UseCourseRealtimeSyncProps) {
  // Track if we've already initialized to prevent duplicate calls
  const hasInitializedRef = useRef(false);

  // Set up realtime progress updates - ONLY ONCE
  useRealtimeProgress({
    onLessonProgressUpdate: () => {
      console.log('🔄 Realtime lesson progress update detected, refreshing podcast progress');
      if (podcast) {
        initializePodcastWithProgress();
      }
    },
    onCourseProgressUpdate: () => {
      console.log('🔄 Realtime course progress update detected, refreshing user progress');
      refetch();
    }
  });

  // Initialize podcast and current lesson when data is loaded - ONLY ONCE
  useEffect(() => {
    if (podcast && !hasInitializedRef.current) {
      console.log('🎯 Podcast loaded for first time, initializing...');
      initializePodcastWithProgress();
      hasInitializedRef.current = true;
    }
  }, [podcast?.id, initializePodcastWithProgress]);

  // Reset initialization flag when course changes
  useEffect(() => {
    hasInitializedRef.current = false;
  }, [podcast?.id]);
}
