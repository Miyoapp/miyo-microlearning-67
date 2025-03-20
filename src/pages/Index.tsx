
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import CategoryFilter from '../components/CategoryFilter';
import PodcastCard from '../components/PodcastCard';
import { Podcast, CategoryModel } from '../types';
import { obtenerCursos, obtenerCategorias } from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryModel | null>(null);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [filteredPodcasts, setFilteredPodcasts] = useState<Podcast[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Cargar datos desde Supabase
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setIsLoading(true);
        // Cargar categorías y cursos en paralelo
        const [categoriasData, cursosData] = await Promise.all([
          obtenerCategorias(),
          obtenerCursos()
        ]);
        
        setCategories(categoriasData);
        setPodcasts(cursosData);
        setFilteredPodcasts(cursosData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast({
          title: "Error al cargar datos",
          description: "No se pudieron cargar los datos. Por favor, intenta de nuevo.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };
    
    cargarDatos();
  }, [toast]);
  
  // Filter podcasts when category changes
  useEffect(() => {
    if (selectedCategory) {
      setFilteredPodcasts(podcasts.filter(podcast => podcast.category.id === selectedCategory.id));
    } else {
      setFilteredPodcasts(podcasts);
    }
  }, [selectedCategory, podcasts]);
  
  // Simulate loading for smooth animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-gray-50">
        <div className="miyo-container">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block py-1 px-8 rounded-full bg-miyo-100 text-miyo-800 text-sm font-medium mb-4 animate-fade-in">
              Aprende en cualquier momento y lugar
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-slide-down">
              Microaprendizaje en <span className="text-miyo-800">audio</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 animate-slide-up">
              Expande tu conocimiento con lecciones breves diseñadas para tu ritmo de vida.
            </p>
            <div className="flex justify-center">
              <Button className="bg-miyo-800 hover:bg-miyo-700 text-white w-32 py-4 h-auto rounded-lg shadow-sm">
                Explorar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="miyo-container">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
                Podcasts Destacados
              </h2>
              
              <CategoryFilter 
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPodcasts.map((podcast, index) => (
                  <div 
                    key={podcast.id} 
                    className={`opacity-0 ${isLoaded ? 'animate-scale-in opacity-100' : ''}`} 
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <PodcastCard podcast={podcast} />
                  </div>
                ))}
              </div>
            )}
            
            {!isLoading && filteredPodcasts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600">No se encontraron podcasts en esta categoría.</p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="miyo-container">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Miyo. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
