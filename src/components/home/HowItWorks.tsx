
import React from 'react';
import { Lightbulb, HeadphonesIcon, Gauge } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const HowItWorks = () => {
  const steps = [
    {
      icon: <Lightbulb className="h-12 w-12 text-miyo-600" />,
      title: "Selecciona tu curso",
      description: "Explora nuestra biblioteca de contenido o carga tu propia documentación empresarial."
    },
    {
      icon: <HeadphonesIcon className="h-12 w-12 text-miyo-600" />,
      title: "Escucha y aprende",
      description: "Consume lecciones en audio de 5-10 minutos durante tus desplazamientos o tiempos muertos."
    },
    {
      icon: <Gauge className="h-12 w-12 text-miyo-600" />,
      title: "Progresa constantemente",
      description: "Completa módulos a tu ritmo y mantén un aprendizaje consistente sin esfuerzo."
    },
  ];

  return (
    <section className="py-20 px-4 bg-gray-50 sm:px-6 lg:px-8">
      <div className="miyo-container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-miyo-100 text-miyo-800 text-sm font-medium mb-4">
            Metodología
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Cómo funciona MIYO</h2>
          <p className="text-lg text-gray-600">
            Nuestra plataforma está diseñada para maximizar el aprendizaje minimizando el tiempo que dedicas.
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
