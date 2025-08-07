
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const HomeHero = () => {
  const navigate = useNavigate();

  const handleEmpezarAhora = () => {
    navigate('/login?mode=signup');
  };

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-gray-50">
      <div className="miyo-container">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 animate-slide-down">
            Microcursos de desarrollo personal en{' '}
            <span className="text-miyo-800">audio</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 animate-slide-up max-w-3xl mx-auto">
            Descubre nuevas herramientas para crecer a través de cápsulas que inspiran y empoderan.
          </p>
          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-miyo-800 hover:bg-miyo-700 text-white px-8 py-4 h-auto text-lg font-medium"
              onClick={handleEmpezarAhora}
            >
              🎧 Explorar cursos
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
