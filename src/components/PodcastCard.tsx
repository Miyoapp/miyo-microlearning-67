
import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, BookOpen } from 'lucide-react';
import { Podcast } from '../types';
import { Button } from '@/components/ui/button';
import PremiumBadge from './PremiumBadge';
import { formatDuration } from '@/lib/formatters';

interface PodcastCardProps {
  podcast: Podcast;
}

const PodcastCard: React.FC<PodcastCardProps> = ({ podcast }) => {
  const totalDuration = podcast.lessons.reduce((acc, lesson) => acc + lesson.duracion, 0);
  const lessonsCount = podcast.lessons.length;

  return (
    <Link 
      to={`/dashboard/course/${podcast.id}`}
      className="group block w-full"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={podcast.imageUrl}
            alt={podcast.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Premium Badge */}
          {podcast.tipo_curso === 'pago' && (
            <div className="absolute top-3 right-3">
              <PremiumBadge />
            </div>
          )}
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <Button
              size="icon"
              className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm text-miyo-800 hover:bg-white hover:text-miyo-700 transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-lg"
            >
              <Play className="h-5 w-5 ml-0.5" />
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-miyo-800 transition-colors">
            {podcast.title}
          </h3>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-1">
            {podcast.category.nombre}
          </p>
          
          {/* Creator Info */}
          <div className="flex items-center space-x-2 mb-3">
            <img
              src={podcast.creator.imageUrl || '/placeholder.svg'}
              alt={podcast.creator.nombre}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-sm text-gray-700 font-medium">
              {podcast.creator.nombre}
            </span>
          </div>
          
          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <BookOpen className="h-4 w-4" />
              <span>{lessonsCount} lecciones</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(totalDuration)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PodcastCard;
