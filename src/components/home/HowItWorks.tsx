import React from 'react';
import { Search, Clock, TrendingUp } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: <Search className="h-12 w-12 text-miyo-600" />,
      title: "Elige tu camino",
      description: "Explora nuestra colección de microcursos en audio"
    },
    {
      number: "02", 
      icon: <Clock className="h-12 w-12 text-miyo-600" />,
      title: "Escucha en cualquier momento",
      description: "Los cursos están diseñados en cápsulas de 15 a 60 minutos"
    },
    {
      number: "03",
      icon: <TrendingUp className="h-12 w-12 text-miyo-600" />,
      title: "Aprende",
      description: "Contenido práctico y accionable para tu crecimiento"
    },
  ];

  return (
    <section className="py-20 px-4 bg-gray-50 sm:px-6 lg:px-8">
      <div className="miyo-container">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ¿Cómo funciona?
          </h2>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                {/* Número del paso */}
                <div className="mb-6">
                  <div className="text-6xl font-bold text-miyo-200 mb-4 group-hover:text-miyo-300 transition-colors">
                    {step.number}
                  </div>
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-white rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                      {step.icon}
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
