
import React from 'react';
import LearningPath from '@/components/LearningPath';
import { Podcast, Lesson } from '@/types';

interface CourseLearningPathSectionProps {
  podcast: Podcast;
  currentLessonId: string | null;
  onSelectLesson: (lesson: Lesson) => void;
}

const CourseLearningPathSection: React.FC<CourseLearningPathSectionProps> = ({
  podcast,
  currentLessonId,
  onSelectLesson
}) => {
  return (
    <div id="learning-path-section" className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-6">Ruta de aprendizaje</h2>
      <LearningPath 
        lessons={podcast.lessons}
        modules={podcast.modules}
        onSelectLesson={onSelectLesson}
        currentLessonId={currentLessonId}
      />
    </div>
  );
};

export default CourseLearningPathSection;
