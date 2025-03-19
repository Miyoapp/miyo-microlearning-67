
import React from "react";
import BenefitCard from "./BenefitCard";
import { 
  Zap, 
  SlidersHorizontal, 
  BarChart3, 
  ListChecks, 
  Clock, 
  TrendingUp 
} from "lucide-react";

const BenefitsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="miyo-container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Por qué elegir Miyo para tu capacitación
          </h2>
          <p className="text-xl text-gray-600">
            Transformamos la capacitación empresarial con una experiencia de aprendizaje única y efectiva.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <BenefitCard 
            icon={<Zap className="h-6 w-6 text-miyo-600" />}
            title="Aprendizaje acelerado"
            description="Formato de audio que facilita la absorción de información y mejora la retención de conocimientos."
          />
          <BenefitCard
            icon={<SlidersHorizontal className="h-6 w-6 text-miyo-600" />}
            title="Contenido inteligente"
            description="Información adaptada a las necesidades específicas de cada empresa y usuario."
          />
          <BenefitCard
            icon={<BarChart3 className="h-6 w-6 text-miyo-600" />}
            title="Analítica detallada"
            description="Seguimiento en tiempo real del progreso y comprensión de los usuarios."
          />
          <BenefitCard
            icon={<ListChecks className="h-6 w-6 text-miyo-600" />}
            title="Experiencia atractiva"
            description="Formato de microaprendizaje que mantiene el interés y reduce la fatiga de aprendizaje."
          />
          <BenefitCard
            icon={<Clock className="h-6 w-6 text-miyo-600" />}
            title="Ahorro de tiempo"
            description="Reduce el tiempo de creación de materiales de capacitación y acelera el proceso de aprendizaje."
          />
          <BenefitCard
            icon={<TrendingUp className="h-6 w-6 text-miyo-600" />}
            title="Escalabilidad"
            description="Solución que crece con tu empresa, adaptándose a nuevas necesidades y volúmenes de usuarios."
          />
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
