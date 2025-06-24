
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import CoursePageHeader from '../components/course/CoursePageHeader';
import CourseMainContent from '../components/course/CourseMainContent';
import CourseLearningPathSection from '../components/course/CourseLearningPathSection';
import CourseLoading from '../components/course/CourseLoading';
import CourseNotFound from '../components/course/CourseNotFound';
import BackButton from '../components/common/BackButton';
import { useCourseData } from '../hooks/useCourseData';
import { useLessons } from '../hooks/useLessons';
import { LessonModel } from '../types';

const DashboardCourse = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [selectedLesson, setSelectedLesson] = useState<LessonModel | null>(null);
  
  const { 
    podcast: course, 
    isLoading: courseLoading 
  } = useCourseData(courseId);

  const {
    currentLesson,
    lessons
  } = useLessons(course);

  useEffect(() => {
    if (course && lessons.length > 0 && !selectedLesson) {
      const firstLesson = lessons[0];
      setSelectedLesson(firstLesson);
    }
  }, [course, lessons, selectedLesson]);

  const handleSelectLesson = (lesson: LessonModel) => {
    setSelectedLesson(lesson);
  };

  if (courseLoading) {
    return (
      <DashboardLayout>
        <CourseLoading />
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <CourseNotFound />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <div className="flex justify-start">
          <BackButton className="mb-2" />
        </div>

        {/* Course Header */}
        <CoursePageHeader course={course} />
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <CourseMainContent 
              course={course}
              currentLesson={selectedLesson || currentLesson}
              onSelectLesson={handleSelectLesson}
            />
          </div>
          
          {/* Learning Path Sidebar - Takes 1 column on large screens */}
          <div className="lg:col-span-1">
            <CourseLearningPathSection
              course={course}
              currentLessonId={selectedLesson?.id || currentLesson?.id}
              onSelectLesson={handleSelectLesson}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardCourse;
