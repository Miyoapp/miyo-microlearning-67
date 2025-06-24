
import { Link } from 'react-router-dom';
import { Podcast } from '../types';
import { Clock, Headphones } from 'lucide-react';
import { formatMinutesToHumanReadable } from '@/lib/formatters';
import PremiumBadge from '@/components/PremiumBadge';

interface PodcastCardProps {
  podcast: Podcast;
}

const PodcastCard = ({ podcast }: PodcastCardProps) => {
  return (
    <Link 
      to={`/course/${podcast.id}`} 
      className="card-hover bg-white rounded-2xl overflow-hidden shadow-sm w-full h-full flex flex-col group"
    >
      <div className="aspect-[4/3] relative overflow-hidden flex-shrink-0">
        <img 
          src={podcast.imageUrl}
          alt={podcast.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {podcast.tipo_curso === 'pago' && (
          <PremiumBadge />
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 sm:p-4">
          <span className="inline-block px-2 sm:px-3 py-1 bg-miyo-800/90 text-white text-xs font-medium rounded-full">
            {podcast.category.nombre}
          </span>
        </div>
      </div>
      
      <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between min-h-0">
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-bold mb-3 line-clamp-2 leading-tight">
            {podcast.title}
          </h3>
          
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <img 
                src={podcast.creator.imageUrl} 
                alt={podcast.creator.name}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover flex-shrink-0"
              />
              <span className="text-sm text-gray-600 truncate">{podcast.creator.name}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-4 mt-auto pt-3 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-500">
            <Clock size={16} className="mr-1 flex-shrink-0" />
            <span>{formatMinutesToHumanReadable(podcast.duration)}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Headphones size={16} className="mr-1 flex-shrink-0" />
            <span>{podcast.lessonCount} lecciones</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PodcastCard;
