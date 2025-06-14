
import React from 'react';

const FavoriteMoments = () => {
  const moments = [
    {
      id: 1,
      title: "Manejando",
      image: "https://images.unsplash.com/photo-1518887574845-c445b9a70352?auto=format&fit=crop&w=600&q=80", // Modern car dashboard/driver POV
      description: "Aprovecha el trayecto para crecer"
    },
    {
      id: 2,
      title: "Entrenando",
      image: "https://images.unsplash.com/photo-1517832606294-7e43b19245d8?auto=format&fit=crop&w=600&q=80", // Modern gym/people listening & training
      description: "Fortalece cuerpo y mente al mismo tiempo"
    },
    {
      id: 3,
      title: "Transporte",
      image: "https://images.unsplash.com/photo-1482062364825-616fd23b8fc1?auto=format&fit=crop&w=600&q=80", // Modern urban train/metro scene
      description: "Convierte cada viaje en una oportunidad"
    },
    {
      id: 4,
      title: "Tomando café",
      image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=80", // Stylish coffee shop with laptop or headphones
      description: "Momentos de pausa para reflexionar"
    },
    {
      id: 5,
      title: "Antes de dormir",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80", // Night lamp, cozy bed, young person with headphones
      description: "Termina el día con pensamientos positivos"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="miyo-container">
        <div className="max-w-6xl mx-auto">
          {/* Título */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Elige tu momento favorito para aprender
            </h2>
          </div>

          {/* Grid de momentos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {moments.map((moment) => (
              <div 
                key={moment.id}
                className="group cursor-pointer"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  {/* Imagen */}
                  <div 
                    className="aspect-[3/4] bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${moment.image})` }}
                  >
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>
                    
                    {/* Contenido */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                      <h3 className="text-lg font-bold mb-2">
                        {moment.title}
                      </h3>
                      <p className="text-sm opacity-90 leading-tight">
                        {moment.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FavoriteMoments;

