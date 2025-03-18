
import { BookOpen } from 'lucide-react';

const AboutSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="miyo-container">
        <div className="mx-auto max-w-3xl text-center">
          <BookOpen size={48} className="mx-auto text-miyo-800 mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            ¿Qué es Miyo?
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Miyo es una plataforma de microaprendizaje a través de podcast que 
            te permite adquirir conocimientos valiosos en pequeñas dosis. 
            Diseñada para personas ocupadas que quieren seguir aprendiendo sin 
            sacrificar su tiempo, Miyo ofrece contenido de calidad narrado por 
            expertos en diversos temas, convirtiendo momentos cotidianos en 
            oportunidades para crecer profesional y personalmente.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
