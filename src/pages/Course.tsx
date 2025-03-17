
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import AudioPlayer from '../components/AudioPlayer';
import { Podcast, Lesson, Module } from '../types';
import CourseHero from '../components/course/CourseHero';
import CourseContent from '../components/course/CourseContent';
import CourseFooter from '../components/course/CourseFooter';
import { obtenerCursoPorId } from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";

const Course = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Fetch podcast data
  useEffect(() => {
    const cargarCurso = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const podcastData = await obtenerCursoPorId(id);
        
        if (podcastData) {
          // Generate modules if they don't exist
          if (!podcastData.modules || podcastData.modules.length === 0) {
            const defaultModules: Module[] = [
              {
                id: 'module-1',
                title: 'Conceptos Básicos',
                lessonIds: podcastData.lessons.slice(0, 2).map(l => l.id)
              },
              {
                id: 'module-2',
                title: 'Técnicas Intermedias',
                lessonIds: podcastData.lessons.slice(2, 4).map(l => l.id)
              },
              {
                id: 'module-3',
                title: 'Aplicación Práctica',
                lessonIds: podcastData.lessons.slice(4).map(l => l.id)
              }
            ];
            
            podcastData.modules = defaultModules;
          }
          
          // Asegurar que todas las lecciones tengan el estado correcto
          const updatedLessons = initializeLessonsState(podcastData.lessons);
          podcastData.lessons = updatedLessons;
          
          setPodcast(podcastData);
          
          // Establecer la primera lección como actual, pero no iniciar reproducción
          const firstLesson = updatedLessons[0];
          if (firstLesson) {
            setCurrentLesson(firstLesson);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error al cargar curso:", error);
        toast({
          title: "Error al cargar curso",
          description: "No se pudo cargar el curso solicitado. Por favor, intenta de nuevo.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };
    
    cargarCurso();
  }, [id, toast]);
  
  // Inicializar el estado de las lecciones (solo la primera desbloqueada)
  const initializeLessonsState = (lessons: Lesson[]): Lesson[] => {
    return lessons.map((lesson, index) => {
      if (index === 0) {
        // Primera lección desbloqueada
        return { ...lesson, isLocked: false, isCompleted: false };
      } else {
        // Resto de lecciones bloqueadas
        return { ...lesson, isLocked: true, isCompleted: false };
      }
    });
  };
  
  // Handle selecting a lesson
  const handleSelectLesson = (lesson: Lesson) => {
    if (lesson.isLocked) {
      toast({
        title: "Lección bloqueada",
        description: "Completa las lecciones anteriores para desbloquear esta.",
        variant: "default"
      });
      return;
    }
    
    setCurrentLesson(lesson);
    // No iniciar reproducción automáticamente al seleccionar
    setIsPlaying(false);
  };
  
  // Handle toggling play state
  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Handle lesson completion
  const handleLessonComplete = () => {
    if (!podcast || !currentLesson) return;
    
    // Obtener el índice de la lección actual
    const currentIndex = podcast.lessons.findIndex(lesson => lesson.id === currentLesson.id);
    if (currentIndex === -1) return;
    
    // Crear una copia de las lecciones para modificar
    const updatedLessons = [...podcast.lessons];
    
    // Marcar la lección actual como completada
    updatedLessons[currentIndex] = { ...updatedLessons[currentIndex], isCompleted: true };
    
    // Desbloquear la siguiente lección si existe
    if (currentIndex + 1 < updatedLessons.length) {
      updatedLessons[currentIndex + 1] = { ...updatedLessons[currentIndex + 1], isLocked: false };
    }
    
    // Actualizar el podcast con las nuevas lecciones
    setPodcast({ ...podcast, lessons: updatedLessons });
    
    // Notificar al usuario
    toast({
      title: "¡Lección completada!",
      description: currentIndex + 1 < updatedLessons.length 
        ? "La siguiente lección ha sido desbloqueada." 
        : "¡Has completado todas las lecciones!",
      variant: "default"
    });
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
        <h2 className="text-2xl font-bold mb-4">Curso no encontrado</h2>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-miyo-800 text-white rounded-full"
        >
          Volver al inicio
        </button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header />
      <CourseHero podcast={podcast} />
      <CourseContent 
        podcast={podcast}
        currentLessonId={currentLesson?.id || null}
        onSelectLesson={handleSelectLesson}
      />
      <AudioPlayer 
        lesson={currentLesson}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onComplete={handleLessonComplete}
      />
      <CourseFooter />
    </div>
  );
};

export default Course;
