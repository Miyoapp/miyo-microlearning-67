
import { Podcast, Lesson } from '../../types';
import LearningPath from '../LearningPath';
import CourseStats from './CourseStats';

interface CourseContentProps {
  podcast: Podcast;
  currentLessonId: string | null;
  isGloballyPlaying: boolean;
  onSelectLesson: (lesson: Lesson, shouldAutoPlay?: boolean) => void;
  onProgressUpdate?: (position: number) => void;
  onLessonComplete?: () => void;
}

const CourseContent = ({ 
  podcast, 
  currentLessonId, 
  isGloballyPlaying, 
  onSelectLesson,
  onProgressUpdate,
  onLessonComplete
}: CourseContentProps) => {
  console.log('🏗️ CourseContent render:', {
    podcastTitle: podcast.title,
    currentLessonId,
    isGloballyPlaying,
    hasLessons: podcast.lessons?.length > 0,
    hasModules: podcast.modules?.length > 0
  });

  // Validación de datos antes del renderizado
  if (!podcast) {
    console.error('❌ CourseContent: No podcast data provided');
    return null;
  }

  if (!podcast.lessons || podcast.lessons.length === 0) {
    console.error('❌ CourseContent: No lessons in podcast');
    return (
      <section className="py-4 px-4 sm:px-6 lg:px-8" id="learning-path">
        <div className="miyo-container">
          <div className="text-center py-8">
            <p className="text-gray-500">No hay lecciones disponibles en este curso.</p>
          </div>
        </div>
      </section>
    );
  }

  if (!podcast.modules || podcast.modules.length === 0) {
    console.error('❌ CourseContent: No modules in podcast');
    return (
      <section className="py-4 px-4 sm:px-6 lg:px-8" id="learning-path">
        <div className="miyo-container">
          <div className="text-center py-8">
            <p className="text-gray-500">No hay módulos disponibles en este curso.</p>
          </div>
        </div>
      </section>
    );
  }

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
              onProgressUpdate={onProgressUpdate}
              onLessonComplete={onLessonComplete}
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
