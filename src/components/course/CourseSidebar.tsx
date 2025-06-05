
import React from 'react';
import CourseStats from '@/components/course/CourseStats';
import { Podcast } from '@/types';

interface CourseSidebarProps {
  podcast: Podcast;
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({ podcast }) => {
  return (
    <div className="lg:col-span-1">
      <CourseStats podcast={podcast} />
    </div>
  );
};

export default CourseSidebar;
