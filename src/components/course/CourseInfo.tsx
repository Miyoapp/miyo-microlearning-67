

import { Button } from '@/components/ui/button';
import { Play, Clock, Headphones, GraduationCap } from 'lucide-react';
import { Podcast } from '../../types';
import SoundEqualizer from './SoundEqualizer';
import { formatMinutesToHumanReadable } from '@/lib/formatters';
import CreatorSocialMediaLinks from './CreatorSocialMediaLinks';
import { useGlassEffect } from '@/hooks/useGlassEffect';

interface CourseInfoProps {
  podcast: Podcast;
}

const CourseInfo = ({ podcast }: CourseInfoProps) => {
  const { glassClass } = useGlassEffect();
  
  return (
    <div className={`${glassClass} rounded-3xl p-8 shadow-lg`}>
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Course image */}
        <div className="w-full lg:w-1/3">
          <img 
            src={podcast.imageUrl} 
            alt={podcast.title}
            className="w-full h-auto rounded-xl shadow-md object-cover aspect-square"
          />
          
          {/* Creator info below image on mobile, beside image on desktop */}
          <div className="mt-4 lg:mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img 
                  src={podcast.creator.imageUrl} 
                  alt={podcast.creator.name}
                  className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                />
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Creado por</p>
                  <p className="font-medium text-gray-800">{podcast.creator.name}</p>
                </div>
              </div>
              
              {/* Social media links */}
              <CreatorSocialMediaLinks socialMedia={podcast.creator.socialMedia} className="ml-auto" />
            </div>
          </div>
        </div>
        
        {/* Course details */}
        <div className="w-full lg:w-2/3">
          <div className="mb-6">
            <span className="inline-block py-1 px-3 rounded-full bg-miyo-100 text-miyo-800 text-sm font-medium mb-4">
              {podcast.category.nombre}
            </span>
            <h1 className="text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-miyo-800 to-purple-500 mb-2">
              {podcast.title}
            </h1>
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
            
            {podcast.nivel && (
              <SoundEqualizer 
                icon={<GraduationCap size={16} className="mr-1" />} 
                text={podcast.nivel} 
              />
            )}
          </div>
          
          {/* Course description */}
          <div className="mb-8 relative">
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-miyo-800 to-miyo-600 rounded-full"></div>
            <div className="pl-6">
              <h3 className="text-lg font-medium mb-3 text-gray-800">Sobre este viaje</h3>
              <p className="text-gray-700 leading-relaxed">{podcast.description}</p>
            </div>
          </div>
          
          {/* Start Learning button - stylized play button */}
          <div className="flex justify-center lg:justify-start">
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
      </div>
    </div>
  );
};

export default CourseInfo;
