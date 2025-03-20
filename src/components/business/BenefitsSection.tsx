
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
            Ventajas
          </h2>
          <p className="text-xl text-gray-600">
            Capacitación empresarial eficiente y efectiva.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <BenefitCard 
            icon={<Zap className="h-6 w-6 text-miyo-600" />}
            title="Aprendizaje rápido"
            description="Mejor absorción y retención de conocimientos."
          />
          <BenefitCard
            icon={<SlidersHorizontal className="h-6 w-6 text-miyo-600" />}
            title="Personalización"
            description="Contenido adaptado a necesidades específicas."
          />
          <BenefitCard
            icon={<BarChart3 className="h-6 w-6 text-miyo-600" />}
            title="Analítica"
            description="Seguimiento en tiempo real del progreso."
          />
          <BenefitCard
            icon={<ListChecks className="h-6 w-6 text-miyo-600" />}
            title="Engagement"
            description="Formato que mantiene el interés del usuario."
          />
          <BenefitCard
            icon={<Clock className="h-6 w-6 text-miyo-600" />}
            title="Ahorro de tiempo"
            description="Creación rápida y aprendizaje eficiente."
          />
          <BenefitCard
            icon={<TrendingUp className="h-6 w-6 text-miyo-600" />}
            title="Escalabilidad"
            description="Crece con tu empresa y necesidades."
          />
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
