
import React from 'react';
import { Button } from '@/components/ui/button';

const HomeHero = () => {
  const handleEmpezarAhora = () => {
    // Implementar navegación a registro o scroll a categorías
    console.log('Empezar ahora clicked');
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
            Conecta con tu mejor versión a través de cápsulas que inspiran, transforman y empoderan.
          </p>
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              size="lg"
              className="border-miyo-800 text-miyo-800 hover:bg-miyo-50 px-8 py-4 h-auto text-lg font-medium"
              onClick={handleEmpezarAhora}
            >
              EMPIEZA AHORA
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
