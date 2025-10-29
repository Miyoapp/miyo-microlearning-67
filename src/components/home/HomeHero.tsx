
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { getOptimizedCloudinaryUrl, CloudinaryPresets } from '@/utils/cloudinary';

const HomeHero = () => {
  const navigate = useNavigate();
  
  const handleEmpezarAhora = () => {
    navigate('/login?mode=signup');
  };

  const cardImages = [
    'https://res.cloudinary.com/dyjx9cjat/image/upload/v1761764190/Captura_de_pantalla_2025-08-08_a_la_s_3.56.24_p._m._tvxusy.png',
    'https://res.cloudinary.com/dyjx9cjat/image/upload/Captura_de_pantalla_2025-08-08_a_la_s_3.55.53_p._m._mhiugd.png',
    'https://res.cloudinary.com/dyjx9cjat/image/upload/v1761765032/Captura_de_pantalla_2025-08-08_a_la_s_3.56.33_p._m._dfivml.png',
    'https://res.cloudinary.com/dyjx9cjat/image/upload/v1761764204/Captura_de_pantalla_2025-08-08_a_la_s_3.56.06_p._m._rac6wc.png',
    'https://res.cloudinary.com/dyjx9cjat/image/upload/v1761764221/Captura_de_pantalla_2025-08-08_a_la_s_3.56.41_p._m._di1ktt.png',
    'https://res.cloudinary.com/dyjx9cjat/image/upload/Captura_de_pantalla_2025-08-08_a_la_s_3.56.51_p._m._irhv5q.png'
  ];

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-gray-50">
      <div className="miyo-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 animate-slide-down">
              Microcursos en{' '}
              <span className="text-miyo-800">audio</span>
              {' '}para conocerte, crecer y avanzar a tu ritmo
            </h1>
            <p className="text-xl text-gray-600 mb-12 animate-slide-up md:text-lg">
              Aprende con expertos sobre autoconocimiento, bienestar, relaciones, productividad y más, de forma práctica y flexible.
            </p>
            <div className="flex justify-start">
              <Button 
                size="lg" 
                className="bg-miyo-800 hover:bg-miyo-700 text-white px-8 py-4 h-auto text-lg font-medium" 
                onClick={handleEmpezarAhora}
              >
                🎧 Explorar cursos
              </Button>
            </div>
          </div>

          {/* Right Column - Image Grid */}
          <div className="grid grid-cols-2 gap-4 lg:gap-6">
            {cardImages.map((image, index) => (
              <div 
                key={index}
                className="bg-gray-900 rounded-lg p-1 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <img
                  src={`${getOptimizedCloudinaryUrl(image, CloudinaryPresets.CARD_IMAGE)}?v=${import.meta.env.VITE_ASSET_VERSION || '1760029966'}`}
                  alt={`Course preview ${index + 1}`}
                  className="w-full h-32 md:h-36 lg:h-40 object-cover rounded-sm"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
