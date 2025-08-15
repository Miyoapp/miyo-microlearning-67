
import React from 'react';
import LearningPath from '@/components/LearningPath';
import { Podcast, Lesson } from '@/types';

interface CourseLearningPathSectionProps {
  podcast: Podcast;
  currentLessonId: string | null;
  onSelectLesson: (lesson: Lesson) => void;
  onLessonComplete: (lessonId: string) => void;
  onProgressUpdate: (lessonId: string, position: number) => void;
}

const CourseLearningPathSection: React.FC<CourseLearningPathSectionProps> = ({
  podcast,
  currentLessonId,
  onSelectLesson,
  onLessonComplete,
  onProgressUpdate
}) => {
  return (
    <div id="learning-path-section" className="bg-white rounded-2xl shadow-sm p-6">
      <LearningPath 
        lessons={podcast.lessons}
        modules={podcast.modules}
        onSelectLesson={onSelectLesson}
        onLessonComplete={onLessonComplete}
        onProgressUpdate={onProgressUpdate}
        currentLessonId={currentLessonId}
      />
    </div>
  );
};

export default CourseLearningPathSection;
