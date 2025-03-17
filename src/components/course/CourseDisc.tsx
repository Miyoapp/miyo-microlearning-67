
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Podcast } from '../../types';

interface CourseDiscProps {
  podcast: Podcast;
  percentComplete: number;
}

const CourseDisc = ({ podcast, percentComplete }: CourseDiscProps) => {
  return (
    <div className="relative">
      {/* Spinning vinyl/CD effect */}
      <div className="spinning-disc relative w-[320px] h-[320px] lg:w-[400px] lg:h-[400px] rounded-full bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl flex items-center justify-center animate-[spin_20s_linear_infinite]">
        {/* Course image in center */}
        <div className="absolute w-[85%] h-[85%] rounded-full overflow-hidden shadow-inner border-8 border-gray-700">
          <img 
            src={podcast.imageUrl} 
            alt={podcast.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Progress circular indicator */}
        <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
          <circle 
            cx="50" 
            cy="50" 
            r="48" 
            fill="none" 
            stroke="#5e16ea" 
            strokeWidth="2" 
            strokeDasharray={`${percentComplete * 3.02} 302`} 
            className="transition-all duration-1000"
          />
        </svg>
        
        {/* Center hole */}
        <div className="absolute w-[10%] h-[10%] rounded-full bg-gray-800 z-10"></div>
      </div>
      
      {/* Creator avatar positioned over the disc */}
      <div className="absolute bottom-0 right-0 transform translate-x-1/4">
        <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
          <AvatarImage src={podcast.creator.imageUrl} alt={podcast.creator.name} />
          <AvatarFallback>{podcast.creator.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default CourseDisc;
