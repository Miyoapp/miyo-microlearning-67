
import React from 'react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';
import Logo from '../common/Logo';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="miyo-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-1">
            <Logo className="mb-4" />
            <p className="text-gray-600 mb-4">
              Transformando el aprendizaje a través del audio.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-miyo-600 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-miyo-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-miyo-600 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-miyo-600 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Plataforma</h3>
            <ul className="space-y-3">
              <li><Link to="/personas" className="text-gray-600 hover:text-miyo-800 transition-colors">Para Individuos</Link></li>
              <li><Link to="/business" className="text-gray-600 hover:text-miyo-800 transition-colors">Para Empresas</Link></li>
              <li><a href="#" className="text-gray-600 hover:text-miyo-800 transition-colors">Características</a></li>
              <li><a href="#" className="text-gray-600 hover:text-miyo-800 transition-colors">Precios</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Recursos</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-miyo-800 transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-600 hover:text-miyo-800 transition-colors">Guías</a></li>
              <li><a href="#" className="text-gray-600 hover:text-miyo-800 transition-colors">Webinars</a></li>
              <li><a href="#" className="text-gray-600 hover:text-miyo-800 transition-colors">Centro de ayuda</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Empresa</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-miyo-800 transition-colors">Sobre nosotros</a></li>
              <li><a href="#" className="text-gray-600 hover:text-miyo-800 transition-colors">Contáctanos</a></li>
              <li><a href="#" className="text-gray-600 hover:text-miyo-800 transition-colors">Carreras</a></li>
              <li><a href="#" className="text-gray-600 hover:text-miyo-800 transition-colors">Socios</a></li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} MIYO. Todos los derechos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-600 hover:text-miyo-800 text-sm transition-colors">Términos</a>
            <a href="#" className="text-gray-600 hover:text-miyo-800 text-sm transition-colors">Privacidad</a>
            <a href="#" className="text-gray-600 hover:text-miyo-800 text-sm transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
