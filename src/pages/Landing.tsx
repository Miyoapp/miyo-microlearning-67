
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden bg-gradient-to-br from-miyo-50 to-white">
        <div className="container px-4 mx-auto">
          <div className="flex flex-wrap items-center -mx-4">
            <div className="w-full px-4 mb-16 md:w-1/2 md:mb-0">
              <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl text-gray-900">
                Microaprendizaje. <br />
                <span className="text-miyo-800">Impacto macro.</span>
              </h1>
              <p className="mb-8 text-lg text-gray-600 md:text-xl">
                Aprende nuevas habilidades en minutos, no horas. Lecciones de audio concisas diseñadas para adaptarse a tu vida ocupada.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button size="lg" className="bg-miyo-800 hover:bg-miyo-700">
                    Comenzar gratis
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-miyo-800 text-miyo-800 hover:bg-miyo-50">
                    Iniciar sesión
                  </Button>
                </Link>
              </div>
            </div>
            <div className="w-full px-4 md:w-1/2">
              <img 
                src="/placeholder.svg" 
                alt="Miyo Learning Platform" 
                className="mx-auto rounded-lg shadow-xl w-full max-w-md" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Diseñado para todos
            </h2>
            <p className="text-lg text-gray-600">
              Soluciones de microaprendizaje para individuos y empresas
            </p>
          </div>

          <Tabs defaultValue="individuals" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="individuals" className="text-lg py-3">Para individuos</TabsTrigger>
              <TabsTrigger value="businesses" className="text-lg py-3">Para empresas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="individuals" className="bg-white p-6 rounded-lg shadow-sm">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Crecimiento personal, a tu ritmo</h3>
                <p className="text-gray-600">
                  Aprende nuevas habilidades, desarrolla tus talentos y mejora tu carrera profesional con lecciones de audio de alta calidad que puedes escuchar en cualquier momento y lugar.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 mt-1 text-miyo-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="ml-2">Acceso a cientos de temas</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 mt-1 text-miyo-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="ml-2">Contenido actualizado regularmente</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 mt-1 text-miyo-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="ml-2">Sigue tu progreso personal</span>
                  </li>
                </ul>
                <Link to="/register">
                  <Button className="mt-4 bg-miyo-800 hover:bg-miyo-700">
                    Empieza tu viaje
                  </Button>
                </Link>
              </div>
            </TabsContent>
            
            <TabsContent value="businesses" className="bg-white p-6 rounded-lg shadow-sm">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Desarrollo de talento corporativo</h3>
                <p className="text-gray-600">
                  Mejora las habilidades de tu equipo con soluciones de microaprendizaje diseñadas para empresas. Formación efectiva sin interferir con la productividad.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 mt-1 text-miyo-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="ml-2">Panel de administración para equipos</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 mt-1 text-miyo-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="ml-2">Contenido personalizado para tu industria</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 mt-1 text-miyo-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="ml-2">Analíticas detalladas de progreso</span>
                  </li>
                </ul>
                <Button className="mt-4 bg-miyo-800 hover:bg-miyo-700">
                  Contactar ventas
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              ¿Por qué elegir Miyo?
            </h2>
            <p className="text-lg text-gray-600">
              Nuestro enfoque único de microaprendizaje está diseñado para maximizar la retención y minimizar el tiempo invertido
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 mb-4 text-white bg-miyo-800 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Aprendizaje eficiente</h3>
              <p className="text-gray-600">
                Lecciones breves y concisas de 5-10 minutos que se adaptan a tu agenda ocupada.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 mb-4 text-white bg-miyo-800 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Contenido de calidad</h3>
              <p className="text-gray-600">
                Creado por expertos en la industria para garantizar información precisa y actualizada.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 mb-4 text-white bg-miyo-800 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Aprende a tu ritmo</h3>
              <p className="text-gray-600">
                Accede al contenido cuando lo necesites, desde cualquier dispositivo, en cualquier momento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-miyo-800 text-white">
        <div className="container px-4 mx-auto text-center">
          <h2 className="mb-6 text-3xl font-bold">
            Comienza tu viaje de aprendizaje hoy
          </h2>
          <p className="max-w-xl mx-auto mb-8 text-lg">
            Únete a miles de personas que están mejorando sus habilidades en minutos al día
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="bg-white text-miyo-800 hover:bg-gray-100">
              Registrarse gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="text-xl font-bold text-miyo-800">MIYO</div>
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} Miyo. Todos los derechos reservados.
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-miyo-800">Términos</a>
              <a href="#" className="text-gray-600 hover:text-miyo-800">Privacidad</a>
              <a href="#" className="text-gray-600 hover:text-miyo-800">Contacto</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
