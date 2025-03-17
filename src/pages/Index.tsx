
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import CategoryFilter from '../components/CategoryFilter';
import PodcastCard from '../components/PodcastCard';
import { Podcast, Category } from '../types';
import { podcasts, categories } from '../data/podcasts';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [filteredPodcasts, setFilteredPodcasts] = useState<Podcast[]>(podcasts);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Filter podcasts when category changes
  useEffect(() => {
    if (selectedCategory) {
      setFilteredPodcasts(podcasts.filter(podcast => podcast.category === selectedCategory));
    } else {
      setFilteredPodcasts(podcasts);
    }
  }, [selectedCategory]);
  
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
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-gray-50">
        <div className="miyo-container">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-miyo-100 text-miyo-800 text-sm font-medium mb-4 animate-fade-in">
              Aprende en cualquier momento y lugar
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 animate-slide-down">
              Microaprendizaje, <span className="text-miyo-800">impacto macro</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 animate-slide-up">
              Expande tu conocimiento con lecciones de audio breves diseñadas para personas ocupadas. Aprende de expertos en minutos al día.
            </p>
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
            
            {filteredPodcasts.length === 0 && (
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
