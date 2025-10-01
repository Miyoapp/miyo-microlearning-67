
import React from 'react';
import LearningPath from '@/components/LearningPath';
import { Podcast, Lesson } from '@/types';

interface CourseLearningPathSectionProps {
  podcast: Podcast;
  currentLessonId: string | null;
  isGloballyPlaying: boolean;
  lessonProgress: any[];
  onSelectLesson: (lesson: Lesson) => void;
  onProgressUpdate?: (position: number) => void;
  onLessonComplete?: () => void;
}

const CourseLearningPathSection: React.FC<CourseLearningPathSectionProps> = ({
  podcast,
  currentLessonId,
  isGloballyPlaying,
  lessonProgress,
  onSelectLesson,
  onProgressUpdate,
  onLessonComplete
}) => {

  return (
    <div id="learning-path-section" className="bg-white rounded-2xl shadow-sm p-6">
      <LearningPath 
        lessons={podcast.lessons || []}
        modules={podcast.modules || []}
        currentLessonId={currentLessonId}
        isGloballyPlaying={isGloballyPlaying}
        lessonProgress={lessonProgress}
        podcast={podcast}
      />
    </div>
  );
};

export default CourseLearningPathSection;
