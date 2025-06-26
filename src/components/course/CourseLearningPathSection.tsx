
import React from 'react';
import LearningPath from '@/components/LearningPath';
import { Podcast, Lesson } from '@/types';

interface CourseLearningPathSectionProps {
  podcast: Podcast;
  currentLessonId: string | null;
  onSelectLesson: (lesson: Lesson) => void;
  onTogglePlay: () => void;
}

const CourseLearningPathSection: React.FC<CourseLearningPathSectionProps> = ({
  podcast,
  currentLessonId,
  onSelectLesson,
  onTogglePlay
}) => {
  return (
    <div id="learning-path-section" className="bg-white rounded-2xl shadow-sm p-6">
      <LearningPath 
        lessons={podcast.lessons}
        modules={podcast.modules}
        onSelectLesson={onSelectLesson}
        onTogglePlay={onTogglePlay}
        currentLessonId={currentLessonId}
      />
    </div>
  );
};

export default CourseLearningPathSection;
