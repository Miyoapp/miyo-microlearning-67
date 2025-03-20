
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const HomeHero = () => {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-gray-50">
      <div className="miyo-container">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-miyo-100 text-miyo-800 text-sm font-medium mb-4 animate-fade-in">
            Transforma tu conocimiento
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-slide-down">
            Aprendizaje que se adapta a <span className="text-miyo-800">tu ritmo</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 animate-slide-up">
            Rutas de microaprendizaje en audio para personas y empresas. Aprende o capacita en cualquier momento y lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/personas">
              <Button className="bg-miyo-800 hover:bg-miyo-700 text-white px-6 py-6 h-auto rounded-lg shadow-sm">
                Descubre para Personas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/business">
              <Button variant="outline" className="border-miyo-800 text-miyo-800 hover:bg-miyo-50 px-6 py-6 h-auto rounded-lg">
                Soluciones para Empresas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
