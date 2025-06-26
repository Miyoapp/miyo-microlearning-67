
import React from 'react';
import { Podcast, Lesson } from '@/types';
import CourseHeader from './CourseHeader';
import CourseLearningPathSection from './CourseLearningPathSection';

interface CourseMainContentProps {
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
  onTogglePlay: () => void;
  onShowCheckout: () => void;
}

const CourseMainContent: React.FC<CourseMainContentProps> = ({
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
  onTogglePlay,
  onShowCheckout
}) => {
  return (
    <div className="space-y-6">
      <CourseHeader
        podcast={podcast}
        hasStarted={hasStarted}
        isSaved={isSaved}
        progressPercentage={progressPercentage}
        isCompleted={isCompleted}
        isPremium={isPremium}
        hasAccess={hasAccess}
        onStartLearning={onStartLearning}
        onToggleSave={onToggleSave}
        onShowCheckout={onShowCheckout}
      />
      
      {hasStarted && (
        <CourseLearningPathSection
          podcast={podcast}
          currentLessonId={currentLesson?.id || null}
          onSelectLesson={onSelectLesson}
          onTogglePlay={onTogglePlay}
        />
      )}
    </div>
  );
};

export default CourseMainContent;
