
import { Podcast } from '../../types';

interface CourseStatsProps {
  podcast: Podcast;
}

const CourseStats = ({ podcast }: CourseStatsProps) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm sticky top-32">
      <h3 className="text-xl font-bold mb-4">Course Statistics</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <span className="text-gray-600">Total Duration</span>
          <span className="font-medium">{podcast.duration} minutes</span>
        </div>
        
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <span className="text-gray-600">Lessons</span>
          <span className="font-medium">{podcast.lessonCount}</span>
        </div>
        
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <span className="text-gray-600">Completed</span>
          <span className="font-medium">{podcast.lessons.filter(l => l.isCompleted).length} / {podcast.lessonCount}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Category</span>
          <span className="font-medium">{podcast.category}</span>
        </div>
      </div>
      
      <div className="mt-8">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-miyo-800 h-2.5 rounded-full transition-all duration-500" 
            style={{ 
              width: `${(podcast.lessons.filter(l => l.isCompleted).length / podcast.lessonCount) * 100}%`
            }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-2 text-right">
          {Math.round((podcast.lessons.filter(l => l.isCompleted).length / podcast.lessonCount) * 100)}% Complete
        </p>
      </div>
    </div>
  );
};

export default CourseStats;
