
import { Podcast, Lesson } from '../../types';
import LearningPath from '../LearningPath';
import CourseStats from './CourseStats';

interface CourseContentProps {
  podcast: Podcast;
  currentLessonId: string | null;
  isGloballyPlaying: boolean;
  onSelectLesson: (lesson: Lesson, shouldAutoPlay?: boolean) => void;
}

const CourseContent = ({ podcast, currentLessonId, isGloballyPlaying, onSelectLesson }: CourseContentProps) => {
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
              isGloballyPlaying={isGloballyPlaying}
              podcast={podcast}
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

export default CourseContent;
