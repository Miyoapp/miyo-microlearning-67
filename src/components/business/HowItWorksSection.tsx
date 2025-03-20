
import React from "react";
import StepCard from "./StepCard";
import { FileText, PenLine, LayoutDashboard } from "lucide-react";

const HowItWorksSection = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="miyo-container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Del texto al audio
          </h2>
          <p className="text-xl text-gray-600">
            Tecnología que permite clonar voces y distribuir contenido eficientemente.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StepCard 
            icon={<FileText className="h-10 w-10 text-miyo-700" />} 
            title="Conversión"
            description="Texto a audio de alta calidad con IA avanzada."
            step="1"
          />
          <StepCard 
            icon={<PenLine className="h-10 w-10 text-miyo-700" />} 
            title="Organización"
            description="Rutas de aprendizaje personalizadas y accesibles."
            step="2"
          />
          <StepCard 
            icon={<LayoutDashboard className="h-10 w-10 text-miyo-700" />} 
            title="Análisis"
            description="Métricas detalladas y seguimiento de progreso."
            step="3"
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
