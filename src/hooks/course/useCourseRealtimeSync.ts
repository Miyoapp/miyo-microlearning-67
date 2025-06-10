
import { useEffect } from 'react';
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
  // Set up realtime progress updates
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

  // Initialize podcast and current lesson when data is loaded
  useEffect(() => {
    if (podcast) {
      console.log('Podcast loaded, initializing...');
      initializePodcastWithProgress();
    }
  }, [podcast?.id, initializePodcastWithProgress]);
}
