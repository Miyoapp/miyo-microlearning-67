
import React, { useState, useCallback } from 'react';
import { Podcast, Lesson } from '@/types';
import { useConsolidatedLessons } from '@/hooks/useConsolidatedLessons';
import CourseInfo from './CourseInfo';
import CourseLearningPathSection from './CourseLearningPathSection';
import AudioPlayer from '../AudioPlayer';
import CourseCompletionModal from './CourseCompletionModal';

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
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(currentLesson?.id || null);
  const setPodcast = (podcast: Podcast) => {
    console.log('Podcast updated:', podcast.title);
  };
  
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const {
    currentLesson: consolidatedCurrentLesson,
    isPlaying,
    handleSelectLesson,
    handleTogglePlay,
    handleLessonComplete: originalHandleLessonComplete,
    handleProgressUpdate
  } = useConsolidatedLessons(podcast, setPodcast);

  // Use the currentLesson from props if available, otherwise use consolidated
  const activeLesson = currentLesson || consolidatedCurrentLesson;

  // Enhanced lesson complete handler to show completion modal
  const handleLessonComplete = useCallback(() => {
    originalHandleLessonComplete();
    
    // Check if this was the last lesson and course is now 100% complete
    if (podcast && activeLesson) {
      const isLastLesson = podcast.lessons.every(lesson => 
        lesson.id === activeLesson.id || lesson.isCompleted
      );
      
      if (isLastLesson) {
        // Small delay to let the completion animation finish
        setTimeout(() => {
          setShowCompletionModal(true);
        }, 1000);
      }
    }
  }, [originalHandleLessonComplete, podcast, activeLesson]);

  // Use onSelectLesson from props if provided, otherwise use consolidated
  const handleLessonSelection = onSelectLesson || handleSelectLesson;

  return (
    <div className="space-y-8">
      <CourseInfo podcast={podcast} />
      
      <CourseLearningPathSection
        podcast={podcast}
        currentLessonId={currentLessonId}
        onSelectLesson={handleLessonSelection}
      />
      
      {/* Only show AudioPlayer if user has access */}
      {hasAccess && (
        <AudioPlayer
          lesson={activeLesson}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onComplete={handleLessonComplete}
          onProgressUpdate={handleProgressUpdate}
          courseId={podcast?.id}
        />
      )}

      <CourseCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        courseTitle={podcast?.title || ''}
        courseId={podcast?.id || ''}
      />
    </div>
  );
};

export default CourseMainContent;
