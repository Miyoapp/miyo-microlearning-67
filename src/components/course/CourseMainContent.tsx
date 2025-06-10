
import React from 'react';
import CourseHeader from '@/components/course/CourseHeader';
import CourseLearningPathSection from '@/components/course/CourseLearningPathSection';
import PremiumOverlay from '@/components/course/PremiumOverlay';
import { Podcast, Lesson } from '@/types';

interface CourseMainContentProps {
  podcast: Podcast;
  hasStarted: boolean;
  isSaved: boolean;
  progressPercentage: number;
  currentLessonId: string | null;
  isPremium: boolean;
  hasAccess: boolean;
  onStartLearning: () => void;
  onToggleSave: () => void;
  onSelectLesson: (lesson: Lesson) => void;
  onUnlock: () => void;
}

const CourseMainContent: React.FC<CourseMainContentProps> = ({
  podcast,
  hasStarted,
  isSaved,
  progressPercentage,
  currentLessonId,
  isPremium,
  hasAccess,
  onStartLearning,
  onToggleSave,
  onSelectLesson,
  onUnlock
}) => {
  return (
    <div className="lg:col-span-2">
      <CourseHeader
        podcast={podcast}
        hasStarted={hasStarted}
        isSaved={isSaved}
        progressPercentage={progressPercentage}
        onStartLearning={onStartLearning}
        onToggleSave={onToggleSave}
      />

      <div className="relative">
        <CourseLearningPathSection
          podcast={podcast}
          currentLessonId={currentLessonId}
          onSelectLesson={onSelectLesson}
        />
        
        {/* Premium overlay for learning path - more transparent */}
        {isPremium && !hasAccess && (
          <PremiumOverlay
            onUnlock={onUnlock}
            price={podcast.precio || 0}
            currency={podcast.moneda || 'USD'}
          />
        )}
      </div>
    </div>
  );
};

export default CourseMainContent;
