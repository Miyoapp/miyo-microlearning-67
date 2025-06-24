
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
import { useUserProgress } from '../hooks/useUserProgress';
import { useCoursePurchases } from '../hooks/useCoursePurchases';
import { LessonModel } from '../types';

const DashboardCourse = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [selectedLesson, setSelectedLesson] = useState<LessonModel | null>(null);
  
  const { 
    podcast: course, 
    isLoading: courseLoading 
  } = useCourseData(courseId);

  const { userProgress, startCourse, refetch } = useUserProgress();
  const { hasPurchased } = useCoursePurchases();

  // Get course progress
  const courseProgress = userProgress.find(p => p.course_id === courseId);
  const progressPercentage = courseProgress?.progress_percentage || 0;
  const hasStarted = progressPercentage > 0;
  const isSaved = courseProgress?.is_saved || false;
  const isCompleted = progressPercentage >= 100;

  // Check premium access
  const isPremium = course?.tipo_curso === 'pago';
  const hasAccess = !isPremium || hasPurchased(courseId || '');

  const {
    currentLesson
  } = useLessons(course, () => {});

  useEffect(() => {
    if (course && course.lessons && course.lessons.length > 0 && !selectedLesson) {
      const firstLesson = course.lessons[0];
      setSelectedLesson(firstLesson);
    }
  }, [course, selectedLesson]);

  const handleSelectLesson = (lesson: LessonModel) => {
    setSelectedLesson(lesson);
  };

  const handleStartLearning = async () => {
    if (courseId) {
      await startCourse(courseId);
      await refetch();
    }
  };

  const handleToggleSave = async () => {
    // This would be implemented similar to other pages
    console.log('Toggle save for course:', courseId);
  };

  const handleShowCheckout = () => {
    console.log('Show checkout for course:', courseId);
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
        <CoursePageHeader isReviewMode={isCompleted} />
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <CourseMainContent 
              podcast={course}
              currentLesson={selectedLesson || currentLesson}
              hasStarted={hasStarted}
              isSaved={isSaved}
              progressPercentage={progressPercentage}
              isCompleted={isCompleted}
              isPremium={isPremium}
              hasAccess={hasAccess}
              onStartLearning={handleStartLearning}
              onToggleSave={handleToggleSave}
              onSelectLesson={handleSelectLesson}
              onShowCheckout={handleShowCheckout}
            />
          </div>
          
          {/* Learning Path Sidebar - Takes 1 column on large screens */}
          <div className="lg:col-span-1">
            <CourseLearningPathSection
              podcast={course}
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
