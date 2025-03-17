
import { Headphones } from 'lucide-react';
import TimeDisplay from './TimeDisplay';

interface LessonInfoProps {
  title: string;
  currentTime: number;
  duration: string | number;
}

const LessonInfo = ({ title, currentTime, duration }: LessonInfoProps) => {
  return (
    <div className="flex items-center">
      <div className="w-10 h-10 bg-miyo-100 rounded-full flex items-center justify-center mr-3">
        <Headphones size={20} className="text-miyo-800" />
      </div>
      <div>
        <p className="font-medium text-gray-800">{title}</p>
        <TimeDisplay currentTime={currentTime} duration={duration} />
      </div>
    </div>
  );
};

export default LessonInfo;
