
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import CategoryCard from './CategoryCard';
import { CategoriaLanding } from '@/types/landing';
import { obtenerCategoriasLanding } from '@/lib/api/landingAPI';

const CategoryCarousel: React.FC = () => {
  const [categorias, setCategorias] = useState<CategoriaLanding[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const navigate = useNavigate();

  // Cargar categorías al montar el componente
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const data = await obtenerCategoriasLanding();
        setCategorias(data);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      } finally {
        setIsLoading(false);
      }
    };
    cargarCategorias();
  }, []);

  const itemsPerPage = 3;
  const maxIndex = Math.max(0, categorias.length - itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const handleCategoryClick = (categoria: CategoriaLanding) => {
    console.log('Categoría seleccionada:', categoria.nombre);
    // Aquí se puede implementar la navegación o modal de registro
  };

  const handleEmpiezaAhora = () => {
    navigate('/login?mode=signup');
  };

  const handleAudioPlay = (categoryId: string) => {
    setCurrentlyPlaying(categoryId);
  };

  const handleAudioStop = () => {
    setCurrentlyPlaying(null);
  };

  if (isLoading) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="miyo-container">
          <div className="flex justify-center items-center py-20">
            <div className="text-lg text-gray-600">Cargando categorías...</div>
          </div>
        </div>
      </section>
    );
  }

  if (categorias.length === 0) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="miyo-container">
          <div className="flex justify-center items-center py-20">
            <div className="text-lg text-gray-600">No hay categorías disponibles</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="miyo-container">
        <div className="max-w-7xl mx-auto">
          {/* Título y subtítulo */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tu camino empieza aquí
            </h2>
            <p className="text-xl text-gray-600">
              Explora temas que te inspiren, reten y desarrollen
            </p>
          </div>

          {/* Carousel mejorado */}
          <div className="relative px-12">
            {/* Contenedor del carousel */}
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out gap-8" 
                style={{
                  transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
                  width: `${categorias.length / itemsPerPage * 100}%`
                }}
              >
                {categorias.map(categoria => (
                  <div 
                    key={categoria.id} 
                    className="flex-shrink-0 px-2 relative hover:z-20 transition-all duration-300" 
                    style={{
                      width: `${100 / categorias.length}%`
                    }}
                  >
                    <CategoryCard 
                      categoria={categoria}
                      onClick={handleCategoryClick}
                      currentlyPlaying={currentlyPlaying}
                      onAudioPlay={handleAudioPlay}
                      onAudioStop={handleAudioStop}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Flechas de navegación mejoradas */}
            {categorias.length > itemsPerPage && (
              <>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-xl border-gray-200 hover:bg-gray-50 hover:shadow-2xl transition-all duration-300 z-10 w-12 h-12 rounded-full"
                  onClick={prevSlide} 
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="h-6 w-6 text-gray-700" />
                </Button>

                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-xl border-gray-200 hover:bg-gray-50 hover:shadow-2xl transition-all duration-300 z-10 w-12 h-12 rounded-full"
                  onClick={nextSlide} 
                  disabled={currentIndex >= maxIndex}
                >
                  <ChevronRight className="h-6 w-6 text-gray-700" />
                </Button>
              </>
            )}
          </div>

          {/* Indicadores de posición */}
          {categorias.length > itemsPerPage && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-miyo-800 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Botón CTA centrado */}
          <div className="text-center mt-16">
            <Button 
              size="lg" 
              className="bg-miyo-800 hover:bg-miyo-700 text-white px-8 py-4 h-auto text-lg font-medium transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={handleEmpiezaAhora}
            >
              Empieza Ahora
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryCarousel;
