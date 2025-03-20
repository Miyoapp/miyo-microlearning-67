
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const CallToAction = () => {
  return (
    <section className="py-20 px-4 bg-miyo-50 sm:px-6 lg:px-8">
      <div className="miyo-container">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Únete y descubre el poder del microaprendizaje en audio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/personas">
              <Button className="bg-miyo-800 hover:bg-miyo-700 text-white px-6 py-6 h-auto rounded-lg shadow-sm">
                Personas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/business">
              <Button variant="outline" className="border-miyo-800 text-miyo-800 hover:bg-miyo-100 px-6 py-6 h-auto rounded-lg">
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

export default CallToAction;
