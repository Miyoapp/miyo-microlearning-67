
import React from 'react';
import { Podcast, Lesson } from '@/types';
import CourseInfo from './CourseInfo';
import StructuredLearningPath from '@/components/StructuredLearningPath';

interface CourseStructuredContentProps {
  podcast: Podcast;
  currentLesson: Lesson | null;
  hasStarted: boolean;
  isSaved: boolean;
  progressPercentage: number;
  isCompleted: boolean;
  isPremium: boolean;
  hasAccess: boolean;
  onStartLearning: () => void;
  onToggleSave: () => void;
  onSelectLesson: (lesson: Lesson) => void;
  onShowCheckout: () => void;
}

const CourseStructuredContent: React.FC<CourseStructuredContentProps> = ({
  podcast,
  currentLesson,
  hasStarted,
  isSaved,
  progressPercentage,
  isCompleted,
  isPremium,
  hasAccess,
  onStartLearning,
  onToggleSave,
  onSelectLesson,
  onShowCheckout
}) => {
  return (
    <div className="space-y-8">
      <CourseInfo podcast={podcast} />
      
      {/* Only show structured learning path if user has access */}
      {hasAccess && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <StructuredLearningPath
            lessons={podcast.lessons}
            modules={podcast.modules || []}
            courseId={podcast.id}
            currentLessonId={currentLesson?.id}
          />
        </div>
      )}
    </div>
  );
};

export default CourseStructuredContent;
