
import { Podcast } from '../../types';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CourseInfo from './CourseInfo';
import CourseAnimations from './CourseAnimations';

interface CourseHeroProps {
  podcast: Podcast;
}

const CourseHero = ({ podcast }: CourseHeroProps) => {
  const navigate = useNavigate();
  
  // Calculate percent completed
  const completedLessons = podcast.lessons.filter(l => l.isCompleted).length;
  const percentComplete = Math.round((completedLessons / podcast.lessonCount) * 100);
  
  return (
    <section className="pt-32 pb-16 overflow-hidden relative bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="miyo-container relative z-10">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-miyo-800 mb-8 transition-colors"
        >
          <ChevronLeft size={20} className="mr-1" />
          <span>Volver al Inicio</span>
        </button>
        
        <div className="flex justify-center">
          {/* Full width section with course details */}
          <div className="w-full max-w-4xl">
            <CourseInfo podcast={podcast} />
          </div>
        </div>
      </div>
      
      {/* Add custom styles for animations */}
      <CourseAnimations />
    </section>
  );
};

export default CourseHero;
