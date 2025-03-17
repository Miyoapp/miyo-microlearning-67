
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import AudioPlayer from '../components/AudioPlayer';
import LearningPath from '../components/LearningPath';
import { Podcast, Lesson } from '../types';
import { getPodcastById } from '../data/podcasts';
import { Clock, Headphones, Tag, ChevronLeft } from 'lucide-react';

const Course = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch podcast data
  useEffect(() => {
    if (id) {
      const podcastData = getPodcastById(id);
      
      if (podcastData) {
        setPodcast(podcastData);
        
        // Set first unlocked lesson as current
        const firstAvailableLesson = podcastData.lessons.find(lesson => !lesson.isLocked);
        if (firstAvailableLesson) {
          setCurrentLesson(firstAvailableLesson);
        }
      }
      
      // Simulate loading
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, [id]);
  
  // Handle selecting a lesson
  const handleSelectLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
  };
  
  // Handle lesson completion
  const handleLessonComplete = () => {
    if (!podcast || !currentLesson) return;
    
    // Mark current lesson as completed
    const updatedLessons = podcast.lessons.map(lesson => {
      if (lesson.id === currentLesson.id) {
        return { ...lesson, isCompleted: true };
      }
      return lesson;
    });
    
    // Find the next lesson index
    const currentIndex = updatedLessons.findIndex(lesson => lesson.id === currentLesson.id);
    const nextIndex = currentIndex + 1;
    
    // Unlock the next lesson if it exists
    if (nextIndex < updatedLessons.length) {
      updatedLessons[nextIndex].isLocked = false;
    }
    
    // Update podcast with new lesson states
    setPodcast({ ...podcast, lessons: updatedLessons });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse">
          <div className="w-16 h-16 rounded-full bg-miyo-200"></div>
        </div>
      </div>
    );
  }
  
  if (!podcast) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold mb-4">Course not found</h2>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-miyo-800 text-white rounded-full"
        >
          Go back to home
        </button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header />
      
      {/* Hero Section */}
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
      
      {/* Learning Path Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="miyo-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <LearningPath 
                lessons={podcast.lessons}
                onSelectLesson={handleSelectLesson}
                currentLessonId={currentLesson?.id || null}
              />
            </div>
            
            <div className="lg:col-span-4">
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
            </div>
          </div>
        </div>
      </section>
      
      {/* Audio Player */}
      <AudioPlayer 
        lesson={currentLesson}
        onComplete={handleLessonComplete}
      />
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="miyo-container">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Miyo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Course;
