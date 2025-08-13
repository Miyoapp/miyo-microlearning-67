
import React from 'react';
import { Lesson } from '@/types';
import { Play, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonItemProps {
  lesson: Lesson;
  index: number;
  status: {
    isCompleted: boolean;
    isLocked: boolean;
    isCurrent: boolean;
    canPlay: boolean;
    isFirstInSequence: boolean;
  };
  classes: {
    nodeClasses: string;
    textClasses: string;
  };
  onLessonClick: (lesson: Lesson, shouldAutoPlay?: boolean) => void;
}

const LessonItem = React.memo(({ lesson, index, status, classes, onLessonClick }: LessonItemProps) => {
  const { isCompleted, isCurrent, canPlay } = status;
  const { nodeClasses, textClasses } = classes;
  
  // CLICK HANDLER for play icon - WITH AUTO-PLAY
  const handlePlayClick = () => {
    console.log('🔥🔥🔥 PLAY ICON CLICK - START:', {
      lessonTitle: lesson.title,
      canPlay,
      isCompleted,
      timestamp: new Date().toLocaleTimeString()
    });
    
    if (canPlay) {
      // CRITICAL: Pass shouldAutoPlay=true to force immediate playback
      onLessonClick(lesson, true);
      console.log('🔥🔥🔥 PLAY ICON CLICK - SENT TO onLessonClick with AUTO-PLAY:', lesson.title);
    } else {
      console.log('🚫🚫🚫 PLAY ICON CLICK - LESSON LOCKED:', lesson.title);
    }
  };
  
  // Zigzag effect alternating positions
  const containerAlignment = index % 2 === 0 
    ? "justify-start" 
    : "justify-start ml-[45px]";
  
  return (
    <div className={`flex ${containerAlignment} items-center`}>
      <div 
        className={cn(nodeClasses, { "cursor-pointer": canPlay, "cursor-not-allowed": !canPlay })}
        onClick={handlePlayClick}
      >
        {/* FIXED: All playable lessons show play icon (including completed) */}
        {canPlay ? (
          <Play size={18} fill="white" />
        ) : (
          <Lock size={18} />
        )}
      </div>
      
      {/* Progress indicator for current lesson */}
      {isCurrent && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
      )}
      
      {/* Lesson title WITHOUT onClick - only visual */}
      <div className="ml-3 flex-1 max-w-[280px]">
        <div className={cn(textClasses, "leading-snug")}>
          {lesson.title}
          {isCurrent && (
            <span className="ml-2 text-xs text-green-600">● Reproduciendo</span>
          )}
        </div>
      </div>
    </div>
  );
});

LessonItem.displayName = 'LessonItem';

export default LessonItem;
