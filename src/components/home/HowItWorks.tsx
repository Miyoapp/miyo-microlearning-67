
import React from 'react';
import { Lightbulb, HeadphonesIcon, Gauge } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const HowItWorks = () => {
  const steps = [
    {
      icon: <Lightbulb className="h-12 w-12 text-miyo-600" />,
      title: "Selecciona",
      description: "Explora nuestro contenido o carga tu documentación."
    },
    {
      icon: <HeadphonesIcon className="h-12 w-12 text-miyo-600" />,
      title: "Escucha",
      description: "Lecciones en audio de 5-10 minutos."
    },
    {
      icon: <Gauge className="h-12 w-12 text-miyo-600" />,
      title: "Progresa",
      description: "Completa módulos a tu ritmo y aprende consistentemente."
    },
  ];

  return (
    <section className="py-20 px-4 bg-gray-50 sm:px-6 lg:px-8">
      <div className="miyo-container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Cómo funciona</h2>
          <p className="text-lg text-gray-600">
            Maximiza el aprendizaje, minimiza el tiempo.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center text-center max-w-xs">
                <div className="mb-6 p-4 bg-white rounded-full shadow-sm">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
              
              {index < steps.length - 1 && (
                <Separator className="hidden md:block h-1 w-12 bg-miyo-200" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
