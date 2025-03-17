
import { Podcast } from '../../types';
import { ChevronLeft, Clock, Headphones, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useRef } from 'react';

interface CourseHeroProps {
  podcast: Podcast;
}

const CourseHero = ({ podcast }: CourseHeroProps) => {
  const navigate = useNavigate();
  const audioCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Audio wave animation
  useEffect(() => {
    const canvas = audioCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const waves = [];
    const waveCount = 30;
    const colors = ['#5e16ea', '#7c3aed', '#a78bfa', '#c4b5fd'];
    
    // Initialize waves
    for (let i = 0; i < waveCount; i++) {
      waves.push({
        x: Math.random() * canvas.width,
        y: canvas.height / 2,
        length: Math.random() * 50 + 50,
        amplitude: Math.random() * 20 + 10,
        frequency: Math.random() * 0.01 + 0.01,
        speed: Math.random() * 0.1 + 0.05,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.2
      });
    }
    
    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      waves.forEach(wave => {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        
        for (let x = 0; x < canvas.width; x++) {
          const y = Math.sin(x * wave.frequency + wave.x) * wave.amplitude + canvas.height / 2;
          ctx.lineTo(x, y);
        }
        
        ctx.strokeStyle = wave.color;
        ctx.globalAlpha = wave.opacity;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Move the wave
        wave.x += wave.speed;
        if (wave.x > 1000) wave.x = 0;
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  // Calculate percent completed
  const completedLessons = podcast.lessons.filter(l => l.isCompleted).length;
  const percentComplete = Math.round((completedLessons / podcast.lessonCount) * 100);
  
  return (
    <section className="pt-32 pb-16 overflow-hidden relative bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-20">
        <canvas ref={audioCanvasRef} className="w-full h-full"></canvas>
      </div>
      
      <div className="miyo-container relative z-10">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-miyo-800 mb-8 transition-colors"
        >
          <ChevronLeft size={20} className="mr-1" />
          <span>Volver al Inicio</span>
        </button>
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left circular section - Vinyl/CD style course representation */}
          <div className="w-full lg:w-1/2 flex justify-center">
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
          </div>
          
          {/* Right section with course details */}
          <div className="w-full lg:w-1/2">
            <div className="glass rounded-3xl p-8 backdrop-blur-md">
              <div className="mb-6">
                <span className="inline-block py-1 px-3 rounded-full bg-miyo-100 text-miyo-800 text-sm font-medium mb-4">
                  {podcast.category}
                </span>
                <h1 className="text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-miyo-800 to-purple-500 mb-2">
                  {podcast.title}
                </h1>
                <p className="text-gray-600 font-medium">Por {podcast.creator.name}</p>
              </div>
              
              {/* Sound equalizer style metrics */}
              <div className="flex items-center gap-6 mb-8">
                <div className="flex flex-col items-center">
                  <div className="flex h-[56px] items-end gap-[3px] mb-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div 
                        key={i}
                        className={`w-2 bg-gradient-to-t from-miyo-800 to-purple-400 rounded-full animate-pulse`}
                        style={{ 
                          height: `${Math.random() * 35 + 15}px`,
                          animationDelay: `${i * 0.2}s`,
                          animationDuration: "1.5s"
                        }}
                      ></div>
                    ))}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock size={16} className="mr-1" />
                    <span>{podcast.duration} minutos</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="flex h-[56px] items-end gap-[3px] mb-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div 
                        key={i}
                        className={`w-2 bg-gradient-to-t from-miyo-800 to-purple-400 rounded-full animate-pulse`}
                        style={{ 
                          height: `${Math.random() * 35 + 15}px`,
                          animationDelay: `${i * 0.2 + 0.1}s`,
                          animationDuration: "1.5s"
                        }}
                      ></div>
                    ))}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Headphones size={16} className="mr-1" />
                    <span>{podcast.lessonCount} lecciones</span>
                  </div>
                </div>
              </div>
              
              {/* Course description as music notes */}
              <div className="mb-8 relative">
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-miyo-800 to-miyo-600 rounded-full"></div>
                <div className="pl-6">
                  <h3 className="text-lg font-medium mb-3 text-gray-800">Sobre este viaje</h3>
                  <p className="text-gray-700 leading-relaxed">{podcast.description}</p>
                </div>
              </div>
              
              {/* Start Learning button - stylized play button */}
              <div className="flex justify-center">
                <Button 
                  onClick={() => {
                    const learningPathSection = document.getElementById('learning-path');
                    if (learningPathSection) {
                      learningPathSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="rounded-full px-8 py-6 bg-gradient-to-r from-miyo-800 to-purple-600 hover:from-miyo-700 hover:to-purple-500 shadow-lg shadow-miyo-800/20 group transition-all duration-300 hover:scale-105"
                >
                  <Play size={24} className="mr-2 group-hover:translate-x-1 transition-transform" />
                  <span className="text-lg">Comenzar a Aprender</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add custom styles for animations */}
      <style>
        {`
        @keyframes pulse {
          0%, 100% { transform: scaleY(1); opacity: 0.7; }
          50% { transform: scaleY(1.2); opacity: 1; }
        }
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .spinning-disc::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(circle at center, transparent 40%, rgba(255,255,255,0.1) 60%, transparent 70%);
        }
        `}
      </style>
    </section>
  );
};

export default CourseHero;
