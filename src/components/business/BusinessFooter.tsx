
import React from "react";
import Logo from "../common/Logo";

const BusinessFooter = () => {
  return (
    <footer className="bg-gray-100 py-12">
      <div className="miyo-container">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <div className="mb-4">
                <Logo />
              </div>
              <p className="text-gray-600 mb-6 max-w-md">
                Transformamos la capacitación corporativa con microaprendizaje en formato podcast. 
                Utilizamos IA para convertir documentación en experiencias de audio educativas.
              </p>
              <div className="flex space-x-4">
                <a 
                  href="https://www.instagram.com/miyo.app?igsh=Mzhvd21tcjlianpk" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-miyo-700 transition-colors"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a 
                  href="https://www.linkedin.com/company/miyoapp/?viewAsMember=true" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-miyo-700 transition-colors"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Empresa</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 hover:text-miyo-700 transition-colors">Sobre nosotros</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-miyo-700 transition-colors">Contacto</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-miyo-700 transition-colors">Blog</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <a 
                      href="https://vivid-starburst-622.notion.site/Miyo-Pol-tica-de-Privacidad-238d6ffdc13f80d2899adeaf820c4ce0?source=copy_link" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-miyo-700 transition-colors"
                    >
                      Privacidad
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://vivid-starburst-622.notion.site/Miyo-T-rminos-y-Condiciones-238d6ffdc13f8054b172d3a711c905b5?pvs=143" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-miyo-700 transition-colors"
                    >
                      Términos
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-10 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} Miyo for Business. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BusinessFooter;
