
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const HomeHero = () => {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-gray-50">
      <div className="miyo-container">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-slide-down">
            Microaprendizaje en <span className="text-miyo-800">audio</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 animate-slide-up">
            Conocimiento que se adapta a tu ritmo de vida
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/personas" className="w-full sm:w-32">
              <Button className="bg-miyo-800 hover:bg-miyo-700 text-white w-full py-4 h-auto rounded-lg shadow-sm">
                Personas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/business" className="w-full sm:w-32">
              <Button variant="outline" className="border-miyo-800 text-miyo-800 hover:bg-miyo-50 w-full py-4 h-auto rounded-lg">
                Empresas
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
