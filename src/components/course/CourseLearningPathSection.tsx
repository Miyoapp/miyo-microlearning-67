
import React from 'react';
import LearningPath from '@/components/LearningPath';
import { Podcast, Lesson } from '@/types';

interface CourseLearningPathSectionProps {
  podcast: Podcast;
  currentLessonId: string | null;
  isGloballyPlaying: boolean;
  onSelectLesson: (lesson: Lesson) => void;
  onProgressUpdate?: (position: number) => void;
  onLessonComplete?: () => void;
}

const CourseLearningPathSection: React.FC<CourseLearningPathSectionProps> = ({
  podcast,
  currentLessonId,
  isGloballyPlaying,
  onSelectLesson,
  onProgressUpdate,
  onLessonComplete
}) => {
  return (
    {/* COMPACTO: Reducir padding y usar border radius más compacto en mobile */}
    <div id="learning-path-section" className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
      <LearningPath 
        lessons={podcast.lessons}
        modules={podcast.modules}
        onSelectLesson={onSelectLesson}
        currentLessonId={currentLessonId}
        isGloballyPlaying={isGloballyPlaying}
        onProgressUpdate={onProgressUpdate}
        onLessonComplete={onLessonComplete}
        podcast={podcast}
      />
    </div>
  );
};

export default CourseLearningPathSection;
