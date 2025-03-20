
import React from 'react';
import { Headphones, Building2, Clock, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ValueProposition = () => {
  const features = [
    {
      icon: <Headphones className="h-10 w-10 text-miyo-800" />,
      title: "Microaprendizaje en Audio",
      description: "Contenido educativo en formato de audio optimizado para una absorción eficiente de conocimiento."
    },
    {
      icon: <Clock className="h-10 w-10 text-miyo-800" />,
      title: "Aprende a tu Ritmo",
      description: "Lecciones breves diseñadas para adaptarse a tu agenda diaria, sin importar lo ocupada que sea."
    },
    {
      icon: <Building2 className="h-10 w-10 text-miyo-800" />,
      title: "Soluciones Empresariales",
      description: "Transforma la documentación de tu empresa en rutas de aprendizaje para capacitación efectiva."
    },
    {
      icon: <Globe className="h-10 w-10 text-miyo-800" />,
      title: "Acceso sin Límites",
      description: "Disponible en cualquier dispositivo, en cualquier momento, incluso sin conexión a internet."
    }
  ];

  return (
    <section className="py-20 px-4 bg-white sm:px-6 lg:px-8">
      <div className="miyo-container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Una solución para todas tus necesidades</h2>
          <p className="text-lg text-gray-600">
            Ya sea que busques desarrollo personal o herramientas para capacitar a tu equipo, 
            MIYO ofrece la plataforma ideal para el aprendizaje moderno.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border border-gray-100 shadow-sm hover:shadow transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 bg-miyo-50 p-3 rounded-full">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
