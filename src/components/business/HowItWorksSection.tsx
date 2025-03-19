
import React from "react";
import StepCard from "./StepCard";
import { FileText, PenLine, LayoutDashboard } from "lucide-react";

const HowItWorksSection = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="miyo-container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Transformamos su documentación e información en micropodcasts
          </h2>
          <p className="text-xl text-gray-600">
            Nuestra tecnología permite clonar voces personalizadas. Distribuimos el contenido en rutas de aprendizaje efectivas.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StepCard 
            icon={<FileText className="h-10 w-10 text-miyo-700" />} 
            title="Documentación a micropodcasts"
            description="Convertimos su documentación en contenido de audio de alta calidad utilizando IA avanzada."
            step="Paso 1"
          />
          <StepCard 
            icon={<PenLine className="h-10 w-10 text-miyo-700" />} 
            title="Microcursos disponibles"
            description="Creamos rutas de aprendizaje personalizadas con contenido organizado y accesible."
            step="Paso 2"
          />
          <StepCard 
            icon={<LayoutDashboard className="h-10 w-10 text-miyo-700" />} 
            title="Dashboard completo"
            description="Accede a análisis detallados y monitorea el progreso de todos los participantes."
            step="Paso 3"
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
