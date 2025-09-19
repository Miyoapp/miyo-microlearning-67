import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Star } from 'lucide-react';
import { Podcast } from '@/types';
import { formatMinutesToHumanReadable } from '@/lib/formatters';
import PremiumBadge from './PremiumBadge';
import { usePrefetchStrategy } from '@/hooks/queries/usePrefetchStrategy';

interface PodcastCardOptimizedProps {
  podcast: Podcast;
  showProgress?: boolean;
  progress?: number;
  className?: string;
}

const PodcastCardOptimized: React.FC<PodcastCardOptimizedProps> = ({ 
  podcast, 
  showProgress = false, 
  progress = 0, 
  className = "" 
}) => {
  const { prefetchCourseOnHover, prefetchRelatedCourses } = usePrefetchStrategy();

  const handleMouseEnter = () => {
    // OPTIMIZED: Prefetch course details on hover
    prefetchCourseOnHover(podcast.id);
    
    // Also prefetch related courses if we have category info
    if (podcast.category?.id) {
      prefetchRelatedCourses(podcast.id, podcast.category.id);
    }
  };

  return (
    <Link 
      to={`/dashboard/course/${podcast.id}`}
      className={`block ${className}`}
      onMouseEnter={handleMouseEnter}
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full group">
        {/* Course Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img 
            src={podcast.imageUrl} 
            alt={podcast.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {podcast.tipo_curso === 'pago' && (
            <div className="absolute top-3 right-3">
              <PremiumBadge />
            </div>
          )}
          {showProgress && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent">
              <div className="p-3">
                <div className="w-full bg-white/30 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-white text-sm mt-1">{progress}% completado</p>
              </div>
            </div>
          )}
        </div>

        {/* Course Content */}
        <div className="p-4 sm:p-5">
          <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-miyo-800 transition-colors">
            {podcast.title}
          </h3>
          
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
            <User className="h-4 w-4" />
            <span className="truncate">{podcast.creator.name}</span>
          </div>

          {podcast.category && (
            <Badge variant="secondary" className="mb-3 text-xs">
              {podcast.category.nombre}
            </Badge>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-gray-600 text-sm">
              <Clock className="h-4 w-4" />
              <span>{formatMinutesToHumanReadable(podcast.duration)}</span>
            </div>
            
            <div className="flex items-center gap-1 text-gray-600 text-sm">
              <Star className="h-4 w-4" />
              <span>{podcast.lessonCount || 0} lecciones</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PodcastCardOptimized;