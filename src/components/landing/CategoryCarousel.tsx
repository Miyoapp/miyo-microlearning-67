import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import CategoryCard from './CategoryCard';
import { CategoriaLanding } from '@/types/landing';
import { obtenerCategoriasLanding } from '@/lib/api/landingAPI';

const VISIBLE_CARDS = 5; // Siempre hay un card central destacado, 2 a cada lado

const CategoryCarousel: React.FC = () => {
  const [categorias, setCategorias] = useState<CategoriaLanding[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0); // El index del "centro"
  const [isLoading, setIsLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement>(null);

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

  // Al poner el mouse sobre una tarjeta, la centralizamos
  const handleCardHover = (idxEnCarrusel: number) => {
    // El idxEnCarrusel es el índice en el vector `displayed`
    // Debemos convertirlo al índice global de categorías
    if (categorias.length === 0) return;
    const centro = Math.floor(VISIBLE_CARDS / 2);
    // El displayed está calculado de [-2, -1, 0, 1, 2] respecto al central
    // currentIndex real = idxCategoria + (idxEnCarrusel-centro)
    // Queremos mover el currentIndex tal que la tarjeta hovered sea el centro
    const displayed = getDisplayCategorias();
    const hoveredCategoria = displayed[idxEnCarrusel];
    const hoveredIdxGlobal = categorias.findIndex(c => c.id === hoveredCategoria.id);
    setCurrentIndex(hoveredIdxGlobal);
  };

  // Ajuste: Para evitar zonas en blanco, si hay menos de VISIBLE_CARDS, repetimos las tarjetas
  const getDisplayCategorias = () => {
    const length = categorias.length;
    if (length === 0) return [];
    // Repetimos categorías hasta llenar el mínimo necesario
    const needed = VISIBLE_CARDS;
    let repeated = [];
    while(repeated.length < needed) {
      repeated = repeated.concat(categorias);
    }
    // Y recortamos para obtener siempre VISIBLE_CARDS alrededor del currentIndex
    const arr = [];
    for (let i = -Math.floor(VISIBLE_CARDS/2); i <= Math.floor(VISIBLE_CARDS/2); i++) {
      let idx = (currentIndex + i + categorias.length) % categorias.length;
      arr.push(categorias[idx]);
    }
    return arr;
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % categorias.length);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + categorias.length) % categorias.length);
  };

  const handleCategoryClick = (categoria: CategoriaLanding) => {
    // Aquí puedes abrir un modal o navegar
    // console.log('Categoría seleccionada:', categoria.nombre);
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
      <section className="py-16 bg-white">
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
      <section className="py-16 bg-white">
        <div className="miyo-container">
          <div className="flex justify-center items-center py-20">
            <div className="text-lg text-gray-600">No hay categorías disponibles</div>
          </div>
        </div>
      </section>
    );
  }

  const displayed = getDisplayCategorias();

  return (
    <section className="py-16 bg-white">
      <div className="miyo-container">
        <div className="max-w-7xl mx-auto">
          {/* Título */}
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tu camino empieza aquí
            </h2>
            <p className="text-xl text-gray-600">
              Explora temas que te inspiren, reten y desarrollen
            </p>
          </div>
          {/* Carrusel */}
          <div className="relative flex justify-center items-center" ref={carouselRef}>
            {/* Flecha Izquierda */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 z-10 bg-white/80 hover:bg-white"
              onClick={goPrev}
              aria-label="Anterior"
            >
              <ChevronLeft className="h-8 w-8 text-[#5e17eb]" />
            </Button>

            {/* Carrusel Central */}
            <div className="flex transition-all duration-500 gap-6 mx-14 w-full justify-center items-end select-none">
              {displayed.map((categoria, idx) => {
                // El índice central está expandido
                const isCenter = idx === Math.floor(displayed.length / 2);
                return (
                  <div
                    key={categoria.id + '_' + idx}
                    className={`flex-shrink-0 transition-all duration-300 ease-in-out
                      ${isCenter
                        ? "z-20 scale-110 shadow-2xl ring-4 ring-[#5e17eb] bg-white"
                        : "z-10 scale-95 opacity-70 hover:opacity-90"
                      }
                    `}
                    style={{
                      minWidth: isCenter ? 240 : 160,
                      maxWidth: isCenter ? 290 : 180,
                      height: isCenter ? 370 : 230,
                      marginTop: isCenter ? 0 : 35,
                      borderRadius: 26,
                      background: "#f8f5fd",
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(.4,2.2,.2,1)"
                    }}
                    onMouseEnter={() => handleCardHover(idx)}
                  >
                    <CategoryCard
                      categoria={categoria}
                      expanded={isCenter}
                      onClick={handleCategoryClick}
                      currentlyPlaying={currentlyPlaying}
                      onAudioPlay={handleAudioPlay}
                      onAudioStop={handleAudioStop}
                      // extra?
                    />
                  </div>
                );
              })}
            </div>
            {/* Flecha Derecha */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 z-10 bg-white/80 hover:bg-white"
              onClick={goNext}
              aria-label="Siguiente"
            >
              <ChevronRight className="h-8 w-8 text-[#5e17eb]" />
            </Button>
          </div>
          {/* Botón CTA */}
          <div className="text-center mt-10">
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
