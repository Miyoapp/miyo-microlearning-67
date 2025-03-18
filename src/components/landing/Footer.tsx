
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="miyo-container">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <span className="text-2xl font-bold tracking-tight text-miyo-800">MIYO</span>
            <p className="text-gray-600 mt-2">Microaprendizaje para personas ocupadas</p>
          </div>
          
          <div className="flex flex-col md:flex-row md:space-x-12 space-y-6 md:space-y-0 text-center md:text-left">
            <div className="space-y-4">
              <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-900">Redes sociales</h4>
              <div className="flex space-x-4 justify-center md:justify-start">
                <a href="#" className="text-gray-600 hover:text-miyo-800 transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="#" className="text-gray-600 hover:text-miyo-800 transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="#" className="text-gray-600 hover:text-miyo-800 transition-colors">
                  <Facebook size={20} />
                </a>
                <a href="#" className="text-gray-600 hover:text-miyo-800 transition-colors">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-900">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="#" className="text-gray-600 hover:text-miyo-800 transition-colors">
                    Términos de servicio
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-600 hover:text-miyo-800 transition-colors">
                    Política de privacidad
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="text-center pt-8 mt-8 border-t border-gray-200">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} Miyo. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
