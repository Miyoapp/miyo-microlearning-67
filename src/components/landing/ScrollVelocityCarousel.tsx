
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollVelocity } from '@/components/ui/scroll-velocity';
import CategoryScrollCard from './CategoryScrollCard';
import { CategoriaLanding } from '@/types/landing';
import { obtenerCategoriasLanding } from '@/lib/api/landingAPI';

const ScrollVelocityCarousel: React.FC = () => {
  const [categorias, setCategorias] = useState<CategoriaLanding[]>([]);
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

  const handleEmpiezaAhora = () => {
    navigate('/login?mode=signup');
  };

  const handleCategoryClick = (categoria: CategoriaLanding) => {
    console.log('Categoría seleccionada:', categoria.nombre);
    navigate('/login?mode=signup');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-lg text-gray-600">Cargando categorías...</div>
      </div>
    );
  }

  if (categorias.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-lg text-gray-600">No hay categorías disponibles</div>
      </div>
    );
  }

  // Duplicar categorías para el scroll infinito
  const duplicatedCategories = [...categorias, ...categorias, ...categorias];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
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

          {/* Carrusel con ScrollVelocity - 2 filas */}
          <div className="space-y-8 mb-16">
            {/* Primera fila - velocidad +3 (izquierda a derecha) */}
            <div className="relative">
              <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-white via-white to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-white via-white to-transparent z-10 pointer-events-none" />
              
              <ScrollVelocity velocity={3} className="py-4">
                {duplicatedCategories.map((categoria, index) => (
                  <CategoryScrollCard
                    key={`row1-${categoria.id}-${index}`}
                    categoria={categoria}
                    onClick={() => handleCategoryClick(categoria)}
                  />
                ))}
              </ScrollVelocity>
            </div>

            {/* Segunda fila - velocidad -2 (derecha a izquierda) */}
            <div className="relative">
              <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-white via-white to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-white via-white to-transparent z-10 pointer-events-none" />
              
              <ScrollVelocity velocity={-2} className="py-4">
                {duplicatedCategories.map((categoria, index) => (
                  <CategoryScrollCard
                    key={`row2-${categoria.id}-${index}`}
                    categoria={categoria}
                    onClick={() => handleCategoryClick(categoria)}
                  />
                ))}
              </ScrollVelocity>
            </div>
          </div>

          {/* Botón CTA centrado */}
          <div className="text-center">
            <Button 
              size="lg" 
              className="bg-miyo-800 hover:bg-miyo-700 text-white px-8 py-4 h-auto text-lg font-medium"
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

export default ScrollVelocityCarousel;
