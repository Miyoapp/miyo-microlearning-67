
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="pt-28 pb-16 md:pt-36 md:pb-24 bg-gradient-to-br from-white via-gray-50 to-miyo-50/30">
      <div className="miyo-container">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="inline-block py-1 px-4 rounded-full bg-miyo-100 text-miyo-800 text-sm font-medium mb-4 animate-fade-in">
              Innovación en Capacitación
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-slide-down">
              Transformamos información en <span className="text-miyo-800">micropodcasts</span> de aprendizaje
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl animate-slide-up">
              Plataforma de microaprendizaje que convierte información en contenido audible para capacitar clientes y partners comerciales de forma efectiva.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-miyo-800 hover:bg-miyo-900 text-white font-medium">
                Solicitar demo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
