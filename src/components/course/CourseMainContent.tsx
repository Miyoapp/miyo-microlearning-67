import React, { useState, useCallback } from 'react';
import { Podcast } from '@/types';
import { useConsolidatedLessons } from '@/hooks/useConsolidatedLessons';
import CourseInfo from './CourseInfo';
import CourseLearningPathSection from './CourseLearningPathSection';
import AudioPlayer from '../AudioPlayer';
import CourseCompletionModal from './CourseCompletionModal';

interface CourseMainContentProps {
  podcast: Podcast;
  setPodcast: (podcast: Podcast) => void;
}

const CourseMainContent = ({ podcast }: CourseMainContentProps) => {
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const setPodcast = (podcast: Podcast) => {
    console.log('Podcast updated:', podcast.title);
  };
  
  const onSelectLesson = (lesson: any) => {
    setCurrentLessonId(lesson.id);
  };
  
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const {
    currentLesson,
    isPlaying,
    handleSelectLesson,
    handleTogglePlay,
    handleLessonComplete: originalHandleLessonComplete,
    handleProgressUpdate
  } = useConsolidatedLessons(podcast, setPodcast);

  // Enhanced lesson complete handler to show completion modal
  const handleLessonComplete = useCallback(() => {
    originalHandleLessonComplete();
    
    // Check if this was the last lesson and course is now 100% complete
    if (podcast && currentLesson) {
      const isLastLesson = podcast.lessons.every(lesson => 
        lesson.id === currentLesson.id || lesson.isCompleted
      );
      
      if (isLastLesson) {
        // Small delay to let the completion animation finish
        setTimeout(() => {
          setShowCompletionModal(true);
        }, 1000);
      }
    }
  }, [originalHandleLessonComplete, podcast, currentLesson]);

  return (
    <div className="space-y-8">
      <CourseInfo podcast={podcast} />
      
      <CourseLearningPathSection
        podcast={podcast}
        currentLessonId={currentLessonId}
        onSelectLesson={handleSelectLesson}
      />
      
      <AudioPlayer
        lesson={currentLesson}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onComplete={handleLessonComplete}
        onProgressUpdate={handleProgressUpdate}
        courseId={podcast?.id}
      />

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
