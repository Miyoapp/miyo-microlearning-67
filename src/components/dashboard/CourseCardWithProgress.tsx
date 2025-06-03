
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, Bookmark, BookmarkCheck } from 'lucide-react';
import { Podcast } from '@/types';
import { formatMinutesToHumanReadable } from '@/lib/formatters';

interface CourseCardWithProgressProps {
  podcast: Podcast;
  progress?: number;
  isPlaying?: boolean;
  isSaved?: boolean;
  showProgress?: boolean;
  onPlay?: () => void;
  onToggleSave?: () => void;
  onClick?: () => void;
}

const CourseCardWithProgress: React.FC<CourseCardWithProgressProps> = ({
  podcast,
  progress = 0,
  isPlaying = false,
  isSaved = false,
  showProgress = true,
  onPlay,
  onToggleSave,
  onClick
}) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
      <CardContent className="p-0">
        <div onClick={onClick}>
          <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg">
            <img 
              src={podcast.imageUrl} 
              alt={podcast.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {podcast.title}
            </h3>
            
            <div className="flex items-center space-x-2 mb-2">
              <img 
                src={podcast.creator.imageUrl} 
                alt={podcast.creator.name}
                className="w-5 h-5 rounded-full"
              />
              <span className="text-sm text-gray-600">{podcast.creator.name}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <span>{formatMinutesToHumanReadable(podcast.duration)}</span>
              <span>{podcast.lessonCount} lecciones</span>
            </div>
            
            {showProgress && (
              <div className="mb-3">
                <Progress value={progress} className="h-2" />
                <div className="text-xs text-gray-500 mt-1">{progress}% completado</div>
              </div>
            )}
          </div>
        </div>
        
        <div className="px-4 pb-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.();
            }}
            className="flex items-center space-x-2"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pausar' : 'Reproducir'}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave?.();
            }}
          >
            {isSaved ? 
              <BookmarkCheck className="w-4 h-4 text-miyo-800" /> : 
              <Bookmark className="w-4 h-4" />
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCardWithProgress;
