
import { Podcast } from '../../types';
import { ChevronLeft, Clock, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CourseHeroProps {
  podcast: Podcast;
}

const CourseHero = ({ podcast }: CourseHeroProps) => {
  const navigate = useNavigate();
  
  return (
    <section className="pt-32 pb-16 bg-white border-b border-gray-200">
      <div className="miyo-container">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-miyo-800 mb-8 transition-colors"
        >
          <ChevronLeft size={20} className="mr-1" />
          <span>Back to Home</span>
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-fade-in">
          <div>
            <span className="inline-block py-1 px-3 rounded-full bg-miyo-100 text-miyo-800 text-sm font-medium mb-4">
              {podcast.category}
            </span>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{podcast.title}</h1>
            
            <div className="flex items-center mb-6">
              <img 
                src={podcast.creator.imageUrl} 
                alt={podcast.creator.name}
                className="w-10 h-10 rounded-full object-cover mr-3"
              />
              <div>
                <p className="font-medium">By {podcast.creator.name}</p>
                <div className="flex flex-wrap mt-1">
                  <div className="flex items-center text-sm text-gray-500 mr-4">
                    <Clock size={14} className="mr-1" />
                    <span>{podcast.duration} minutes total</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Headphones size={14} className="mr-1" />
                    <span>{podcast.lessonCount} lessons</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
              <h3 className="text-lg font-medium mb-3">About this course</h3>
              <p className="text-gray-700">{podcast.description}</p>
            </div>
            
            <button className="w-full sm:w-auto px-6 py-3 bg-miyo-800 text-white rounded-full font-medium hover:bg-miyo-700 transition-colors shadow-lg shadow-miyo-800/20">
              Start Learning Now
            </button>
          </div>
          
          <div className="relative">
            <div className="aspect-[3/2] rounded-2xl overflow-hidden shadow-xl">
              <img 
                src={podcast.imageUrl} 
                alt={podcast.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="absolute -bottom-5 -right-5 bg-white p-4 rounded-full shadow-lg">
              <div className="w-20 h-20 rounded-full bg-miyo-800 flex items-center justify-center text-white">
                <span className="font-bold text-xl">{podcast.lessonCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseHero;
