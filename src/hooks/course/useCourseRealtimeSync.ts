
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
  const initializedRef = useRef(false);

  // Set up realtime progress updates with stable callbacks
  const handleLessonProgressUpdate = () => {
    console.log('🔄 Realtime lesson progress update detected, refreshing podcast progress');
    if (podcast) {
      initializePodcastWithProgress();
    }
  };

  const handleCourseProgressUpdate = () => {
    console.log('🔄 Realtime course progress update detected, refreshing user progress');
    refetch();
  };

  useRealtimeProgress({
    onLessonProgressUpdate: handleLessonProgressUpdate,
    onCourseProgressUpdate: handleCourseProgressUpdate
  });

  // Initialize podcast and current lesson when data is loaded (only once)
  useEffect(() => {
    if (podcast && !initializedRef.current) {
      console.log('📦 Podcast loaded, initializing for the first time...');
      initializePodcastWithProgress();
      initializedRef.current = true;
    }
  }, [podcast?.id, initializePodcastWithProgress]);

  // Reset initialization flag when podcast changes
  useEffect(() => {
    initializedRef.current = false;
  }, [podcast?.id]);
}
