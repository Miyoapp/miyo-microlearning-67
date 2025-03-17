
import { Button } from '@/components/ui/button';
import { Play, Clock, Headphones } from 'lucide-react';
import { Podcast } from '../../types';
import SoundEqualizer from './SoundEqualizer';
import { formatMinutesToHumanReadable } from '@/lib/formatters';

interface CourseInfoProps {
  podcast: Podcast;
}

const CourseInfo = ({ podcast }: CourseInfoProps) => {
  return (
    <div className="glass rounded-3xl p-8 backdrop-blur-md">
      <div className="mb-6">
        <span className="inline-block py-1 px-3 rounded-full bg-miyo-100 text-miyo-800 text-sm font-medium mb-4">
          {podcast.category}
        </span>
        <h1 className="text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-miyo-800 to-purple-500 mb-2">
          {podcast.title}
        </h1>
        <p className="text-gray-600 font-medium">Por {podcast.creator.name}</p>
      </div>
      
      {/* Sound equalizer style metrics */}
      <div className="flex items-center gap-6 mb-8">
        <SoundEqualizer 
          icon={<Clock size={16} className="mr-1" />} 
          text={formatMinutesToHumanReadable(podcast.duration)} 
        />
        
        <SoundEqualizer 
          icon={<Headphones size={16} className="mr-1" />} 
          text={`${podcast.lessonCount} lecciones`} 
        />
      </div>
      
      {/* Course description as music notes */}
      <div className="mb-8 relative">
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-miyo-800 to-miyo-600 rounded-full"></div>
        <div className="pl-6">
          <h3 className="text-lg font-medium mb-3 text-gray-800">Sobre este viaje</h3>
          <p className="text-gray-700 leading-relaxed">{podcast.description}</p>
        </div>
      </div>
      
      {/* Start Learning button - stylized play button */}
      <div className="flex justify-center">
        <Button 
          onClick={() => {
            const learningPathSection = document.getElementById('learning-path');
            if (learningPathSection) {
              learningPathSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="rounded-full px-8 py-6 bg-gradient-to-r from-miyo-800 to-purple-600 hover:from-miyo-700 hover:to-purple-500 shadow-lg shadow-miyo-800/20 group transition-all duration-300 hover:scale-105"
        >
          <Play size={24} className="mr-2 group-hover:translate-x-1 transition-transform" />
          <span className="text-lg">Comenzar a Aprender</span>
        </Button>
      </div>
    </div>
  );
};

export default CourseInfo;
