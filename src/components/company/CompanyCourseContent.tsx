
import { Podcast, Lesson } from '../../types';
import LearningPath from '../LearningPath';
import CourseStats from '../course/CourseStats';

interface CompanyCourseContentProps {
  podcast: Podcast;
  currentLessonId: string | null;
  onSelectLesson: (lesson: Lesson) => void;
}

const CompanyCourseContent = ({ podcast, currentLessonId, onSelectLesson }: CompanyCourseContentProps) => {
  return (
    <section className="py-4 px-4 sm:px-6 lg:px-8" id="learning-path">
      <div className="miyo-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex justify-center">
            <LearningPath 
              lessons={podcast.lessons}
              modules={podcast.modules}
              onSelectLesson={onSelectLesson}
              currentLessonId={currentLessonId}
            />
          </div>
          
          <div className="lg:col-span-4">
            <CourseStats podcast={podcast} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyCourseContent;
