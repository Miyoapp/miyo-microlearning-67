
import { useState } from 'react';
import { Lesson } from '../types';
import { Play, Lock, Trophy } from 'lucide-react';

interface LearningPathProps {
  lessons: Lesson[];
  onSelectLesson: (lesson: Lesson) => void;
  currentLessonId: string | null;
}

const LearningPath = ({ lessons, onSelectLesson, currentLessonId }: LearningPathProps) => {
  if (!lessons.length) return null;
  
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-8">Your Learning Path</h2>
      
      <div className="relative">
        {/* Path connector line */}
        <div className="path-connector" />
        
        <div className="space-y-12">
          {lessons.map((lesson, index) => {
            const isCompleted = lesson.isCompleted;
            const isAvailable = !lesson.isLocked;
            const isCurrent = currentLessonId === lesson.id;
            
            // Determine node style
            let nodeClasses = 'path-node ';
            if (isCompleted) nodeClasses += 'path-node-completed';
            else if (isCurrent) nodeClasses += 'path-node-current';
            else if (!isAvailable) nodeClasses += 'path-node-locked';
            else nodeClasses += 'bg-white border border-miyo-200';
            
            // Zigzag pattern - even indices go left, odd go right
            const alignment = index % 2 === 0 ? 'flex-row' : 'flex-row-reverse';
            
            return (
              <div key={lesson.id} className={`flex ${alignment} items-center`}>
                <div className={nodeClasses}>
                  {isCompleted ? (
                    <Trophy size={20} />
                  ) : isCurrent ? (
                    <Play size={20} />
                  ) : isAvailable ? (
                    <Play size={20} className="text-miyo-800" />
                  ) : (
                    <Lock size={20} />
                  )}
                </div>
                
                <div 
                  className={`flex-1 ${index % 2 === 0 ? 'ml-6' : 'mr-6'} bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 ${isAvailable ? 'cursor-pointer' : 'opacity-70'}`}
                  onClick={() => isAvailable && onSelectLesson(lesson)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className={`font-medium ${isCurrent ? 'text-miyo-800' : 'text-gray-800'}`}>
                        {lesson.title}
                      </h4>
                      <p className="text-sm text-gray-500">{lesson.duration} min</p>
                    </div>
                    
                    <div className="ml-4">
                      {isCompleted ? (
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Completed
                        </span>
                      ) : isCurrent ? (
                        <span className="text-sm bg-miyo-100 text-miyo-800 px-2 py-1 rounded-full">
                          In Progress
                        </span>
                      ) : isAvailable ? (
                        <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          Available
                        </span>
                      ) : (
                        <span className="text-sm bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                          Locked
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LearningPath;
