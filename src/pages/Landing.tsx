
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Headphones, BookOpen, Clock, Award, Briefcase, Users, Zap, CheckCircle2, ArrowRight } from "lucide-react";

const Landing = () => {
  const [activeTab, setActiveTab] = useState<string>("personas");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white py-4 border-b border-gray-100 fixed w-full z-50">
        <div className="miyo-container flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-3xl font-bold tracking-tight text-miyo-800">MIYO</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#como-funciona" className="text-gray-600 hover:text-miyo-800 font-medium">¿Cómo funciona?</a>
            <a href="#beneficios" className="text-gray-600 hover:text-miyo-800 font-medium">Beneficios</a>
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-auto"
            >
              <TabsList className="bg-gray-100 h-10">
                <TabsTrigger value="personas" className="px-6">Para personas</TabsTrigger>
                <TabsTrigger value="empresas" className="px-6">Para empresas</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline" className="border-miyo-800 text-miyo-800 hover:bg-miyo-50">
                Iniciar sesión
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-miyo-800 hover:bg-miyo-700">
                Registrarse
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-gray-50 to-miyo-50">
        <div className="miyo-container">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <span className="inline-block py-1 px-3 rounded-full bg-miyo-100 text-miyo-800 text-sm font-medium mb-4 animate-fade-in">
                La nueva forma de aprender
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 animate-slide-down">
                Aprende mientras <span className="text-miyo-800">escuchas</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 animate-slide-up">
                Microaprendizaje a través de podcast para personas ocupadas. Expande tu conocimiento con lecciones de audio breves diseñadas para tu ritmo de vida.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/register">
                  <Button className="w-full sm:w-auto bg-miyo-800 hover:bg-miyo-700 text-white px-8 py-3 rounded-md font-medium">
                    Comenzar ahora <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a href="#como-funciona">
                  <Button variant="outline" className="w-full sm:w-auto border-miyo-800 text-miyo-800 hover:bg-miyo-50 px-8 py-3 rounded-md font-medium">
                    Cómo funciona
                  </Button>
                </a>
              </div>
            </div>
            <div className="lg:w-1/2 relative animate-fade-in">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-miyo-100 rounded-full opacity-70"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-miyo-200 rounded-full opacity-70"></div>
                <img 
                  src="/placeholder.svg" 
                  alt="Persona aprendiendo con auriculares" 
                  className="relative z-10 rounded-lg shadow-xl max-w-full mx-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Qué es Miyo */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="miyo-container">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-miyo-100 text-miyo-800 text-sm font-medium mb-4">
              Sobre Miyo
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              ¿Qué es Miyo?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Miyo es una plataforma de microaprendizaje que transforma contenido educativo extenso en breves episodios de audio 
              diseñados para adaptarse a tu agenda diaria. Aprende conceptos nuevos, mejora tus habilidades y mantente al día con las 
              últimas tendencias en tan solo 5-10 minutos al día, estés donde estés.
            </p>
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-miyo-100 flex items-center justify-center">
                <Headphones className="h-10 w-10 text-miyo-800" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section id="como-funciona" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="miyo-container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="inline-block py-1 px-3 rounded-full bg-miyo-100 text-miyo-800 text-sm font-medium mb-4">
              Proceso Simple
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              ¿Cómo funciona?
            </h2>
            <p className="text-lg text-gray-600">
              Transformamos el aprendizaje tradicional en un proceso simple, flexible y efectivo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <BookOpen className="h-10 w-10 text-miyo-800" />,
                title: "Regístrate",
                description: "Crea tu cuenta en menos de un minuto y accede a nuestra biblioteca de contenido."
              },
              {
                icon: <Headphones className="h-10 w-10 text-miyo-800" />,
                title: "Elige tus temas de interés",
                description: "Selecciona entre una amplia variedad de temas y categorías según tus objetivos."
              },
              {
                icon: <Clock className="h-10 w-10 text-miyo-800" />,
                title: "Aprende en minutos",
                description: "Escucha lecciones concisas de 5-10 minutos mientras realizas tus actividades diarias."
              }
            ].map((step, index) => (
              <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-miyo-100 flex items-center justify-center mx-auto mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section id="beneficios" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="miyo-container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="inline-block py-1 px-3 rounded-full bg-miyo-100 text-miyo-800 text-sm font-medium mb-4">
              Por qué elegirnos
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Beneficios del microaprendizaje
            </h2>
            <p className="text-lg text-gray-600">
              Descubre cómo el aprendizaje en pequeñas dosis puede transformar tu desarrollo personal y profesional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: <Clock className="h-8 w-8 text-miyo-800" />,
                title: "Aprendizaje flexible",
                description: "Aprende a tu ritmo, cuando y donde quieras, sin importar lo ocupado que estés."
              },
              {
                icon: <Zap className="h-8 w-8 text-miyo-800" />,
                title: "Mayor retención",
                description: "Las lecciones breves y enfocadas mejoran la comprensión y retención de información."
              },
              {
                icon: <Award className="h-8 w-8 text-miyo-800" />,
                title: "Expertos en cada tema",
                description: "Contenido creado y revisado por profesionales líderes en sus respectivos campos."
              },
              {
                icon: <CheckCircle2 className="h-8 w-8 text-miyo-800" />,
                title: "Resultados rápidos",
                description: "Aplica lo aprendido de inmediato para ver resultados tangibles en poco tiempo."
              }
            ].map((benefit, index) => (
              <div key={index} className="flex items-start p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="mr-4 p-3 rounded-full bg-miyo-100">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs Personas/Empresas */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="miyo-container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="inline-block py-1 px-3 rounded-full bg-miyo-100 text-miyo-800 text-sm font-medium mb-4">
              Soluciones a medida
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Para personas y empresas
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Ofrecemos soluciones adaptadas tanto a necesidades individuales como corporativas
            </p>

            <Tabs 
              defaultValue="personas" 
              value={activeTab} 
              onValueChange={setActiveTab} 
              className="w-full max-w-md mx-auto"
            >
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 h-12">
                <TabsTrigger value="personas" className="text-base">Para personas</TabsTrigger>
                <TabsTrigger value="empresas" className="text-base">Para empresas</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <TabsContent value="personas" className={activeTab === "personas" ? "block" : "hidden"}>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Desarrollo personal y profesional
                </h3>
                <p className="text-gray-600 mb-6">
                  Transforma tus momentos disponibles en oportunidades de aprendizaje. 
                  Ya sea que busques desarrollo profesional, adquirir nuevas habilidades 
                  o simplemente ampliar tus conocimientos, Miyo te ofrece contenido 
                  premium en un formato eficiente.
                </p>
                <ul className="space-y-3 mb-6">
                  {[
                    "Contenido variado y actualizado regularmente",
                    "Seguimiento de tu progreso personal",
                    "Acceso ilimitado a todas las categorías",
                    "Posibilidad de descargar contenido para escucha offline"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button className="bg-miyo-800 hover:bg-miyo-700 text-white">
                    Comenzar gratis
                  </Button>
                </Link>
              </div>
              <div className="md:w-1/2">
                <img 
                  src="/placeholder.svg" 
                  alt="Persona aprendiendo" 
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="empresas" className={activeTab === "empresas" ? "block" : "hidden"}>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2 order-2 md:order-1">
                <img 
                  src="/placeholder.svg" 
                  alt="Formación para empresas" 
                  className="rounded-lg shadow-lg"
                />
              </div>
              <div className="md:w-1/2 order-1 md:order-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Formación corporativa eficiente
                </h3>
                <p className="text-gray-600 mb-6">
                  Optimiza el desarrollo profesional de tu equipo con nuestra solución 
                  corporativa. Miyo para empresas ofrece un enfoque de aprendizaje flexible 
                  que se adapta a los horarios ocupados de tus colaboradores y mejora 
                  la productividad.
                </p>
                <ul className="space-y-3 mb-6">
                  {[
                    "Contenido personalizado para las necesidades de tu empresa",
                    "Análisis detallado del progreso del equipo",
                    "Panel de administración para gestionar usuarios",
                    "Soporte prioritario y asesoramiento especializado"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button className="bg-miyo-800 hover:bg-miyo-700 text-white">
                  Contactar ventas
                </Button>
              </div>
            </div>
          </TabsContent>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-miyo-800 text-white">
        <div className="miyo-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Comienza tu viaje de aprendizaje hoy
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Transforma tus momentos libres en oportunidades para crecer personal y profesionalmente
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/register">
                <Button className="w-full sm:w-auto bg-white text-miyo-800 hover:bg-gray-100 px-8 py-3 rounded-md font-medium">
                  Registrarse gratis
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-miyo-700 px-8 py-3 rounded-md font-medium">
                  Iniciar sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="miyo-container">
          <div className="flex flex-col md:flex-row justify-between mb-8">
            <div className="mb-8 md:mb-0">
              <span className="text-2xl font-bold text-miyo-800 mb-4 block">MIYO</span>
              <p className="text-gray-600 max-w-xs">
                Transformando el aprendizaje tradicional en experiencias breves y efectivas.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h4 className="text-gray-900 font-semibold mb-4">Empresa</h4>
                <ul className="space-y-2">
                  {["Sobre nosotros", "Contacto", "Carreras", "Blog"].map((item, i) => (
                    <li key={i}>
                      <a href="#" className="text-gray-600 hover:text-miyo-800 transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-gray-900 font-semibold mb-4">Legal</h4>
                <ul className="space-y-2">
                  {["Términos", "Privacidad", "Cookies", "Licencias"].map((item, i) => (
                    <li key={i}>
                      <a href="#" className="text-gray-600 hover:text-miyo-800 transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-gray-900 font-semibold mb-4">Soluciones</h4>
                <ul className="space-y-2">
                  {["Para personas", "Para empresas", "Para educadores", "API"].map((item, i) => (
                    <li key={i}>
                      <a href="#" className="text-gray-600 hover:text-miyo-800 transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm mb-4 sm:mb-0">
              © {new Date().getFullYear()} Miyo. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6">
              {["twitter", "facebook", "instagram", "linkedin"].map((social, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="text-gray-400 hover:text-miyo-800 transition-colors"
                >
                  <span className="sr-only">{social}</span>
                  <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
