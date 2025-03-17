
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
          const updatedLessons = initializeLessonsState(podcastData);
          podcastData.lessons = updatedLessons;
          
          setPodcast(podcastData);
          
          // Establecer la primera lección como actual, pero no iniciar reproducción
          const firstLesson = getFirstAvailableLesson(podcastData);
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
  
  // Obtener la primera lección disponible (no bloqueada)
  const getFirstAvailableLesson = (podcast: Podcast): Lesson | null => {
    return podcast.lessons.find(lesson => !lesson.isLocked) || null;
  };
  
  // Inicializar el estado de las lecciones (solo la primera lección del primer módulo desbloqueada)
  const initializeLessonsState = (podcast: Podcast): Lesson[] => {
    // Si no hay módulos, devolver las lecciones tal cual
    if (!podcast.modules || podcast.modules.length === 0) {
      return podcast.lessons;
    }
    
    // Obtener el ID de la primera lección del primer módulo
    const firstModule = podcast.modules[0];
    const firstLessonId = firstModule.lessonIds[0];
    
    // Actualizar el estado de todas las lecciones
    return podcast.lessons.map(lesson => {
      if (lesson.id === firstLessonId) {
        // Primera lección del primer módulo desbloqueada
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
    
    // Crear una copia de las lecciones para modificar
    const updatedLessons = [...podcast.lessons];
    const modules = [...podcast.modules];
    
    // Encontrar el módulo actual y el índice de la lección actual dentro de ese módulo
    const currentModuleIndex = modules.findIndex(module => 
      module.lessonIds.includes(currentLesson.id)
    );
    
    if (currentModuleIndex === -1) return;
    
    const currentModule = modules[currentModuleIndex];
    const currentLessonIndexInModule = currentModule.lessonIds.indexOf(currentLesson.id);
    
    // Marcar la lección actual como completada
    const lessonIndex = updatedLessons.findIndex(l => l.id === currentLesson.id);
    if (lessonIndex !== -1) {
      updatedLessons[lessonIndex] = { ...updatedLessons[lessonIndex], isCompleted: true };
    }
    
    // Determinar qué lección desbloquear a continuación
    let nextLessonToUnlock: string | null = null;
    let unlockDescription = "";
    
    // Si hay más lecciones en el módulo actual
    if (currentLessonIndexInModule < currentModule.lessonIds.length - 1) {
      // Desbloquear la siguiente lección del mismo módulo
      nextLessonToUnlock = currentModule.lessonIds[currentLessonIndexInModule + 1];
      unlockDescription = "La siguiente lección ha sido desbloqueada.";
    } else {
      // Si es la última lección del módulo actual y hay más módulos
      if (currentModuleIndex < modules.length - 1) {
        // Verificar si todas las lecciones del módulo actual están completadas
        const allLessonsInModuleCompleted = currentModule.lessonIds.every(lessonId => {
          const lesson = updatedLessons.find(l => l.id === lessonId);
          return lesson && (lesson.id === currentLesson.id || lesson.isCompleted);
        });
        
        if (allLessonsInModuleCompleted) {
          // Desbloquear la primera lección del siguiente módulo
          const nextModule = modules[currentModuleIndex + 1];
          nextLessonToUnlock = nextModule.lessonIds[0];
          unlockDescription = "¡Módulo completado! La primera lección del siguiente módulo ha sido desbloqueada.";
        }
      } else {
        // Era la última lección del último módulo
        unlockDescription = "¡Has completado todas las lecciones del curso!";
      }
    }
    
    // Desbloquear la siguiente lección si corresponde
    if (nextLessonToUnlock) {
      const nextLessonIndex = updatedLessons.findIndex(l => l.id === nextLessonToUnlock);
      if (nextLessonIndex !== -1) {
        updatedLessons[nextLessonIndex] = { ...updatedLessons[nextLessonIndex], isLocked: false };
      }
    }
    
    // Actualizar el podcast con las nuevas lecciones
    setPodcast({ ...podcast, lessons: updatedLessons });
    
    // Notificar al usuario
    toast({
      title: "¡Lección completada!",
      description: unlockDescription,
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
