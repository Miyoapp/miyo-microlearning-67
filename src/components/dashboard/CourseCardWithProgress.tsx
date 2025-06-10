
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, Bookmark, BookmarkCheck, Clock, Headphones } from 'lucide-react';
import { Podcast } from '@/types';
import { formatMinutesToHumanReadable } from '@/lib/formatters';
import PremiumBadge from '@/components/PremiumBadge';

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
  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('CourseCard: Toggling save for course:', podcast.id, 'current saved state:', isSaved);
    onToggleSave?.();
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('CourseCard: Playing course:', podcast.id);
    onPlay?.();
  };

  console.log('CourseCard render - Course:', podcast.id, 'isSaved:', isSaved, 'progress:', progress, 'showProgress:', showProgress);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer w-full max-w-sm mx-auto sm:max-w-none">
      <CardContent className="p-0">
        <div onClick={onClick}>
          {/* Mobile-optimized image container */}
          <div className="aspect-video relative overflow-hidden rounded-t-lg">
            <img 
              src={podcast.imageUrl} 
              alt={podcast.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {podcast.tipo_curso === 'pago' && (
              <div className="absolute top-2 right-2">
                <PremiumBadge />
              </div>
            )}
          </div>
          
          {/* Mobile-optimized content */}
          <div className="p-3 sm:p-4">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base leading-tight">
              {podcast.title}
            </h3>
            
            {/* Creator info - optimized for mobile */}
            <div className="flex items-center space-x-2 mb-3">
              <img 
                src={podcast.creator.imageUrl} 
                alt={podcast.creator.name}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex-shrink-0"
              />
              <span className="text-xs sm:text-sm text-gray-600 truncate">{podcast.creator.name}</span>
            </div>
            
            {/* Course stats - mobile layout */}
            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-3">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{formatMinutesToHumanReadable(podcast.duration)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Headphones className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{podcast.lessonCount} lecciones</span>
              </div>
            </div>
            
            {/* Progress bar - full width on mobile */}
            {showProgress && progress > 0 && (
              <div className="mb-3">
                <Progress value={progress} className="h-1.5 sm:h-2" />
                <div className="text-xs text-gray-500 mt-1">{Math.round(progress)}% completado</div>
              </div>
            )}
          </div>
        </div>
        
        {/* Action buttons - mobile optimized */}
        <div className="px-3 pb-3 sm:px-4 sm:pb-4 flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePlayClick}
            className="flex items-center space-x-1 sm:space-x-2 flex-1 text-xs sm:text-sm h-8 sm:h-9"
          >
            {isPlaying ? <Pause className="w-3 h-3 sm:w-4 sm:h-4" /> : <Play className="w-3 h-3 sm:w-4 sm:h-4" />}
            <span className="hidden sm:inline">{isPlaying ? 'Pausar' : 'Reproducir'}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveClick}
            className="h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0"
          >
            {isSaved ? 
              <BookmarkCheck className="w-3 h-3 sm:w-4 sm:h-4 text-miyo-800" /> : 
              <Bookmark className="w-3 h-3 sm:w-4 sm:h-4" />
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCardWithProgress;
