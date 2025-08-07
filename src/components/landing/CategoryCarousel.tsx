
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

  if (isLoading) {
    return <div className="flex justify-center items-center py-20">
        <div className="text-lg text-gray-600">Cargando categorías...</div>
      </div>;
  }

  if (categorias.length === 0) {
    return <div className="flex justify-center items-center py-20">
        <div className="text-lg text-gray-600">No hay categorías disponibles</div>
      </div>;
  }

  return <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="miyo-container">
        <div className="max-w-6xl mx-auto">
          {/* Título y subtítulo */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tu camino empieza aquí
            </h2>
            <p className="text-xl text-gray-600">
              Explora temas que te inspiren, reten y desarrollen
            </p>
          </div>

          {/* Carousel */}
          <div className="relative">
            {/* Contenedor del carousel */}
            <div className="overflow-hidden">
              <div className="flex transition-transform duration-300 ease-in-out gap-6" style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
              width: `${categorias.length / itemsPerPage * 100}%`
            }}>
                {categorias.map(categoria => <div key={categoria.id} className="flex-shrink-0" style={{
                width: `${100 / categorias.length}%`
              }}>
                    <CategoryCard categoria={categoria} />
                  </div>)}
              </div>
            </div>

            {/* Flechas de navegación */}
            {categorias.length > itemsPerPage && <>
                <Button variant="outline" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg border-gray-200 hover:bg-gray-50 z-10" onClick={prevSlide} disabled={currentIndex === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button variant="outline" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg border-gray-200 hover:bg-gray-50 z-10" onClick={nextSlide} disabled={currentIndex >= maxIndex}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>}
          </div>

          {/* Botón CTA centrado - homologado con el botón Registro */}
          <div className="text-center mt-16">
            <Button 
              size="lg" 
              className="bg-miyo-800 hover:bg-miyo-700 text-white px-8 py-4 h-auto text-lg font-medium"
              onClick={handleEmpiezaAhora}
            >
              🎧 Explorar cursos
            </Button>
          </div>
        </div>
      </div>
    </section>;
};

export default CategoryCarousel;
