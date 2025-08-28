
import React, { useState, useCallback } from 'react';
import { Podcast, Lesson } from '@/types';
import CourseAccessHandler from './CourseAccessHandler';
import { useCourseAccess } from '@/hooks/course/useCourseAccess';

interface CoursePageManagerProps {
  podcast: Podcast;
}

const CoursePageManager: React.FC<CoursePageManagerProps> = ({ podcast }) => {
  // State management for the course
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  // Get course access information
  const { isPremium, hasAccess } = useCourseAccess(podcast);

  // Event handlers
  const handleStartLearning = useCallback(() => {
    setHasStarted(true);
    if (podcast.lessons && podcast.lessons.length > 0) {
      setCurrentLesson(podcast.lessons[0]);
    }
  }, [podcast.lessons]);

  const handleToggleSave = useCallback(() => {
    setIsSaved(prev => !prev);
  }, []);

  const handleSelectLesson = useCallback((lesson: Lesson) => {
    setCurrentLesson(lesson);
  }, []);

  const handleShowCheckout = useCallback(() => {
    setShowCheckout(true);
  }, []);

  const handleCloseCheckout = useCallback(() => {
    setShowCheckout(false);
  }, []);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleLessonComplete = useCallback(() => {
    // Mark current lesson as complete and update progress
    setProgressPercentage(prev => Math.min(prev + (100 / podcast.lessonCount), 100));
  }, [podcast.lessonCount]);

  const handleProgressUpdate = useCallback((position: number) => {
    // Update lesson progress based on audio position
    console.log('Progress update:', position);
  }, []);

  const handlePurchaseComplete = useCallback(() => {
    setShowCheckout(false);
    // Refresh the page or update access status
    window.location.reload();
  }, []);

  return (
    <CourseAccessHandler
      podcast={podcast}
      currentLesson={currentLesson}
      hasStarted={hasStarted}
      isSaved={isSaved}
      progressPercentage={progressPercentage}
      isCompleted={isCompleted}
      isPremium={isPremium}
      hasAccess={hasAccess}
      isPlaying={isPlaying}
      showCheckout={showCheckout}
      onStartLearning={handleStartLearning}
      onToggleSave={handleToggleSave}
      onSelectLesson={handleSelectLesson}
      onShowCheckout={handleShowCheckout}
      onCloseCheckout={handleCloseCheckout}
      onTogglePlay={handleTogglePlay}
      onLessonComplete={handleLessonComplete}
      onProgressUpdate={handleProgressUpdate}
      onPurchaseComplete={handlePurchaseComplete}
    />
  );
};

export default CoursePageManager;
