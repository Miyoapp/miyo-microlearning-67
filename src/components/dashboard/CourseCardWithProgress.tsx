
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
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer w-full h-full flex flex-col">
      <CardContent className="p-0 flex flex-col h-full">
        <div onClick={onClick} className="flex-1 flex flex-col h-full">
          {/* Mobile-first image container */}
          <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg flex-shrink-0">
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
          
          {/* Mobile-first content area */}
          <div className="p-4 sm:p-5 flex-1 flex flex-col min-h-0">
            <div className="flex-1 min-h-0">
              <h3 className="font-semibold text-gray-900 mb-3 text-base sm:text-lg leading-tight line-clamp-2">
                {podcast.title}
              </h3>
              
              {/* Creator info */}
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src={podcast.creator.imageUrl} 
                  alt={podcast.creator.name}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0"
                />
                <span className="text-sm text-gray-600 truncate">{podcast.creator.name}</span>
              </div>
              
              {/* Course stats - mobile optimized */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatMinutesToHumanReadable(podcast.duration)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Headphones className="w-4 h-4" />
                  <span>{podcast.lessonCount} lecciones</span>
                </div>
              </div>
              
              {/* Progress bar */}
              {showProgress && progress > 0 && (
                <div className="mb-4">
                  <Progress value={progress} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">{Math.round(progress)}% completado</div>
                </div>
              )}
            </div>
            
            {/* Mobile-first action buttons */}
            <div className="flex items-center justify-between gap-3 mt-auto pt-3 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayClick}
                className="flex items-center space-x-2 flex-1 text-sm h-10"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pausar' : 'Reproducir'}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveClick}
                className="h-10 w-10 p-0 flex-shrink-0"
              >
                {isSaved ? 
                  <BookmarkCheck className="w-4 h-4 text-miyo-800" /> : 
                  <Bookmark className="w-4 h-4" />
                }
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCardWithProgress;
