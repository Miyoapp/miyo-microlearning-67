
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Headphones, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const HeroSection = ({ onLoginClick, onRegisterClick }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden pt-16 md:pt-20 lg:pt-24">
      <div className="miyo-container relative z-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          <div className="flex flex-col space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <span className="inline-block rounded-full bg-miyo-100 px-4 py-1.5 text-sm font-medium text-miyo-800">
                Microaprendizaje en podcast
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
                Aprende mientras <span className="text-miyo-800">escuchas</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
                Microaprendizaje a través de podcast para personas ocupadas. Expande tus conocimientos en minutos al día.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="gap-2 text-base" 
                onClick={onRegisterClick}
              >
                Comenzar ahora <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2 text-base"
                onClick={onLoginClick}
              >
                Iniciar sesión
              </Button>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative h-[350px] w-[350px] sm:h-[400px] sm:w-[400px] md:h-[450px] md:w-[450px]">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-miyo-100 to-miyo-200 opacity-70"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-8 shadow-lg">
                <Headphones size={100} className="text-miyo-800" />
              </div>
              <div className="absolute inset-0 animate-pulse rounded-full bg-miyo-500 opacity-10 blur-3xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decorations */}
      <div className="absolute top-0 right-0 -z-10 opacity-20">
        <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="#7015ea" d="M41.5,-47.3C51.5,-33.9,55.8,-16.9,57.2,1.4C58.5,19.8,57,39.6,47,56.3C37.1,73,18.5,86.7,0.6,86.1C-17.3,85.4,-34.6,70.4,-43.8,54.1C-53,37.8,-54.1,19,-56.3,-1.2C-58.4,-21.4,-61.7,-42.7,-52.5,-56.1C-43.2,-69.5,-21.6,-74.8,-2.3,-72.2C17,-69.5,31.5,-60.7,41.5,-47.3Z" transform="translate(100 100)" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 -z-10 opacity-20">
        <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="#7015ea" d="M53.6,-48.6C66.4,-32.2,72,-11,68.6,9.1C65.2,29.3,52.7,48.4,35.4,58.8C18.1,69.1,-4,70.6,-24.2,63.6C-44.5,56.6,-62.9,41,-69.5,21.4C-76.1,1.8,-70.9,-21.9,-57.8,-38.8C-44.7,-55.7,-23.3,-65.9,-0.7,-65.3C22,-64.8,40.8,-64.9,53.6,-48.6Z" transform="translate(100 100)" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
