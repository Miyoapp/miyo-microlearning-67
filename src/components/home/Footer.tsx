
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Instagram, Linkedin } from 'lucide-react';
import Logo from '../common/Logo';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="miyo-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="col-span-1 md:col-span-2">
            <Logo className="mb-4" />
            <p className="text-gray-600 mb-4">
              Aprendizaje a través de audio
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.instagram.com/miyo.app?igsh=Mzhvd21tcjlianpk" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-miyo-600 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://www.linkedin.com/company/miyoapp/?viewAsMember=true" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-miyo-600 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-miyo-800 transition-colors">Feedback</a></li>
              <li><a href="#" className="text-gray-600 hover:text-miyo-800 transition-colors">Contacto</a></li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} Miyo
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-600 hover:text-miyo-800 text-sm transition-colors">Términos</a>
            <a href="#" className="text-gray-600 hover:text-miyo-800 text-sm transition-colors">Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
