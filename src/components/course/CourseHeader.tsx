
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck, Play } from 'lucide-react';
import { Podcast } from '@/types';
import { formatMinutesToHumanReadable } from '@/lib/formatters';

interface CourseHeaderProps {
  podcast: Podcast;
  hasStarted: boolean;
  isSaved: boolean;
  onStartLearning: () => void;
  onToggleSave: () => void;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({
  podcast,
  hasStarted,
  isSaved,
  onStartLearning,
  onToggleSave
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
      <div className="aspect-[3/1] relative">
        <img 
          src={podcast.imageUrl} 
          alt={podcast.title}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-8">
        <div className="flex items-center space-x-3 mb-4">
          <img 
            src={podcast.creator.imageUrl} 
            alt={podcast.creator.name}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <div className="font-medium text-gray-900">{podcast.creator.name}</div>
            <div className="text-sm text-gray-500">{podcast.category.nombre}</div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{podcast.title}</h1>
        <p className="text-gray-600 mb-6">{podcast.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
          <span>{formatMinutesToHumanReadable(podcast.duration)}</span>
          <span>{podcast.lessonCount} lecciones</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            className="bg-miyo-800 hover:bg-miyo-900 flex items-center space-x-2"
            onClick={onStartLearning}
          >
            <Play className="w-4 h-4" />
            <span>{hasStarted ? 'Continuar aprendiendo' : 'Comenzar a aprender'}</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={onToggleSave}
            className="flex items-center space-x-2"
          >
            {isSaved ? 
              <BookmarkCheck className="w-4 h-4 text-miyo-800" /> : 
              <Bookmark className="w-4 h-4" />
            }
            <span>{isSaved ? 'Guardado' : 'Guardar'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseHeader;
