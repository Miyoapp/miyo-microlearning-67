
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
  isGloballyPlaying: boolean;
  onStartLearning: () => void;
  onToggleSave: () => void;
  onSelectLesson: (lesson: Lesson) => void;
  onShowCheckout: () => void;
  onProgressUpdate: (position: number) => void;
  onLessonComplete: () => void;
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
  isGloballyPlaying,
  onStartLearning,
  onToggleSave,
  onSelectLesson,
  onShowCheckout,
  onProgressUpdate,
  onLessonComplete
}) => {
  console.log('🔍 CourseMainContent: Render iniciado con props:', {
    podcastTitle: podcast?.title,
    currentLessonTitle: currentLesson?.title,
    hasStarted,
    isSaved,
    progressPercentage,
    isCompleted,
    isPremium,
    hasAccess,
    isGloballyPlaying,
    timestamp: new Date().toISOString()
  });

  // Verificar que el podcast sea válido
  if (!podcast) {
    console.error('❌ CourseMainContent: podcast es null o undefined');
    return <div>Error: No se pudo cargar el curso</div>;
  }

  console.log('✅ CourseMainContent: Podcast válido, renderizando componentes');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-8">
      {/* Main Content - Full width on mobile */}
      <div className="lg:col-span-2">
        <CourseHeader
          podcast={podcast}
          hasStarted={hasStarted}
          isSaved={isSaved}
          progressPercentage={progressPercentage}
          onStartLearning={onStartLearning}
          onToggleSave={onToggleSave}
        />

        <div className="relative sm:mx-0">
          <CourseLearningPathSection
            podcast={podcast}
            currentLessonId={currentLesson?.id || null}
            isGloballyPlaying={isGloballyPlaying}
            onSelectLesson={onSelectLesson}
            onProgressUpdate={onProgressUpdate}
            onLessonComplete={onLessonComplete}
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

      {/* Sidebar - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:block">
        <CourseSidebar 
          podcast={podcast}
          progressPercentage={progressPercentage}
          isCompleted={isCompleted}
        />
      </div>
    </div>
  );
};

export default CourseMainContent;
