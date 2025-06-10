
import React, { useState, useEffect } from 'react';
import PodcastCard from '../PodcastCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle, RefreshCw } from 'lucide-react';
import { obtenerCursos } from '@/lib/api';
import { Podcast } from '@/types';
import { useToast } from '@/components/ui/use-toast';

const FeaturedCourses = () => {
  const [featuredCourses, setFeaturedCourses] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadFeaturedCourses();
  }, []);

  const loadFeaturedCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const cursos = await obtenerCursos();
      // Get just 4 random courses for featured section
      const randomCourses = cursos.sort(() => Math.random() - 0.5).slice(0, 4);
      setFeaturedCourses(randomCourses);
      
      if (randomCourses.some(course => course.creator.name === 'Creador Desconocido')) {
        console.warn("Algunos cursos no tienen información de creador");
        toast({
          title: "Información parcial",
          description: "Algunos cursos pueden mostrar información incompleta",
          variant: "default"
        });
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error al cargar cursos destacados:", err);
      setError("No se pudieron cargar los cursos destacados");
      setIsLoading(false);
      toast({
        title: "Error",
        description: "No se pudieron cargar los cursos destacados",
        variant: "destructive"
      });
    }
  };

  const handleRetry = () => {
    loadFeaturedCourses();
  };

  return (
    <section className="py-12 sm:py-20 px-4 bg-white sm:px-6 lg:px-8">
      <div className="miyo-container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 sm:mb-12">
          <div>
            <span className="inline-block py-1 px-3 rounded-full bg-miyo-100 text-miyo-800 text-sm font-medium mb-4">
              Cursos Destacados
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Comienza tu viaje de aprendizaje</h2>
          </div>
          <Link to="/personas" className="mt-4 md:mt-0">
            <Button variant="link" className="text-miyo-800 hover:text-miyo-600 p-0">
              Ver todos los cursos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse h-[400px]">
                <div className="aspect-[4/3] bg-gray-200"></div>
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-100">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <p className="text-lg text-gray-700 mb-4">{error}</p>
            <Button 
              variant="outline"
              onClick={handleRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Intentar de nuevo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {featuredCourses.map((podcast, index) => (
              <div 
                key={podcast.id} 
                className="opacity-0 animate-scale-in opacity-100 h-full" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <PodcastCard podcast={podcast} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCourses;
