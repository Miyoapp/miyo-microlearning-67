
import React, { useState, useEffect } from 'react';
import PodcastCard from '../PodcastCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { obtenerCursos } from '@/lib/api';
import { Podcast } from '@/types';

const FeaturedCourses = () => {
  const [featuredCourses, setFeaturedCourses] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedCourses = async () => {
      try {
        setIsLoading(true);
        const cursos = await obtenerCursos();
        // Get just 4 random courses for featured section
        const randomCourses = cursos.sort(() => Math.random() - 0.5).slice(0, 4);
        setFeaturedCourses(randomCourses);
        setIsLoading(false);
      } catch (error) {
        console.error("Error al cargar cursos destacados:", error);
        setIsLoading(false);
      }
    };

    loadFeaturedCourses();
  }, []);

  return (
    <section className="py-20 px-4 bg-white sm:px-6 lg:px-8">
      <div className="miyo-container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <span className="inline-block py-1 px-3 rounded-full bg-miyo-100 text-miyo-800 text-sm font-medium mb-4">
              Cursos Destacados
            </span>
            <h2 className="text-3xl font-bold text-gray-900">Comienza tu viaje de aprendizaje</h2>
          </div>
          <Link to="/personas" className="mt-4 md:mt-0">
            <Button variant="link" className="text-miyo-800 hover:text-miyo-600 p-0">
              Ver todos los cursos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="aspect-[4/3] bg-gray-200"></div>
                <div className="p-5">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="flex space-x-2 mb-3">
                    <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="flex space-x-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCourses.map((podcast, index) => (
              <div 
                key={podcast.id} 
                className="opacity-0 animate-scale-in opacity-100" 
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
