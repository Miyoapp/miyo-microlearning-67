
import { useRealtimeProgress } from '@/hooks/useRealtimeProgress';
import { Podcast } from '@/types';

interface UseCourseRealtimeSyncProps {
  podcast: Podcast | null;
  refetch: () => void;
  onProgressUpdate: () => void;
}

export function useCourseRealtimeSync({
  podcast,
  refetch,
  onProgressUpdate
}: UseCourseRealtimeSyncProps) {
  // Set up realtime progress updates
  useRealtimeProgress({
    onLessonProgressUpdate: () => {
      console.log('🔄 Realtime lesson progress update detected');
      onProgressUpdate();
    },
    onCourseProgressUpdate: () => {
      console.log('🔄 Realtime course progress update detected, refreshing user progress');
      refetch();
    }
  });
}
