
import { Link } from 'react-router-dom';
import { Podcast } from '../types';
import { Clock, Headphones, Tag } from 'lucide-react';

interface PodcastCardProps {
  podcast: Podcast;
}

const PodcastCard = ({ podcast }: PodcastCardProps) => {
  return (
    <Link 
      to={`/course/${podcast.id}`} 
      className="card-hover bg-white rounded-2xl overflow-hidden shadow-sm"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={podcast.imageUrl}
          alt={podcast.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <span className="inline-block px-3 py-1 bg-miyo-800/90 text-white text-xs font-medium rounded-full">
            {podcast.category}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold mb-2 line-clamp-2">{podcast.title}</h3>
        
        <div className="flex items-center gap-2 mb-3">
          <img 
            src={podcast.creator.imageUrl} 
            alt={podcast.creator.name}
            className="w-6 h-6 rounded-full object-cover"
          />
          <span className="text-sm text-gray-600">{podcast.creator.name}</span>
        </div>
        
        <div className="flex flex-wrap gap-y-2">
          <div className="flex items-center mr-4 text-sm text-gray-500">
            <Clock size={16} className="mr-1" />
            <span>{podcast.duration} min</span>
          </div>
          
          <div className="flex items-center mr-4 text-sm text-gray-500">
            <Headphones size={16} className="mr-1" />
            <span>{podcast.lessonCount} lessons</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PodcastCard;
