
import React from 'react';
import CourseStats from '@/components/course/CourseStats';
import { Podcast } from '@/types';

interface CourseSidebarProps {
  podcast: Podcast;
  progressPercentage?: number;
  isCompleted?: boolean;
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({ 
  podcast, 
  progressPercentage = 0,
  isCompleted = false 
}) => {
  return (
    <div className="lg:col-span-1">
      <CourseStats 
        podcast={podcast} 
        progressPercentage={progressPercentage}
        isCompleted={isCompleted}
      />
    </div>
  );
};

export default CourseSidebar;
