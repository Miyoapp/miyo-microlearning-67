
import React from 'react';
import { Podcast, Lesson } from '@/types';
import CourseHeader from './CourseHeader';
import CourseLearningPathSection from './CourseLearningPathSection';
import CourseSidebar from './CourseSidebar';
import PremiumOverlay from './PremiumOverlay';

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
  onShowCheckout
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
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
            currentLessonId={currentLesson?.id || null}
            onSelectLesson={onSelectLesson}
          />
          
          {/* Premium overlay for learning path */}
          {isPremium && !hasAccess && (
            <PremiumOverlay
              onUnlock={onShowCheckout}
              price={podcast.precio || 0}
              currency={podcast.moneda || 'USD'}
            />
          )}
        </div>
      </div>

      {/* Sidebar */}
      <CourseSidebar 
        podcast={podcast}
        progressPercentage={progressPercentage}
        isCompleted={isCompleted}
      />
    </div>
  );
};

export default CourseMainContent;
