
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth/AuthModal";

const Landing = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const navigate = useNavigate();

  const openLoginModal = () => {
    setAuthView("login");
    setAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthView("register");
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 py-4 bg-white">
        <div className="miyo-container flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-3xl font-bold tracking-tight text-miyo-800">MIYO</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={openLoginModal}>
              Iniciar Sesión
            </Button>
            <Button onClick={openRegisterModal}>
              Registrarse
            </Button>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-indigo-50 to-white">
        <div className="miyo-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
                Aprende mientras escuchas
              </h1>
              <p className="text-xl text-gray-600">
                Microaprendizaje a través de podcast para personas ocupadas. Adquiere conocimientos valiosos en minutos, no en horas.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={openRegisterModal}>
                  Comenzar ahora
                </Button>
                <Button size="lg" variant="outline" onClick={openLoginModal}>
                  Iniciar sesión
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <img 
                src="/placeholder.svg" 
                alt="Persona aprendiendo con auriculares" 
                className="max-w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* ¿Qué es Miyo? */}
      <section className="py-16 bg-white">
        <div className="miyo-container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">¿Qué es Miyo?</h2>
            <p className="text-lg text-gray-600">
              Miyo es una plataforma de microaprendizaje que ofrece contenido educativo a través de podcast. 
              Nuestros episodios cortos y enfocados te permiten aprender conceptos clave de diversos temas en solo 5-10 minutos al día.
            </p>
          </div>
        </div>
      </section>
      
      {/* Beneficios */}
      <section className="py-16 bg-gray-50">
        <div className="miyo-container">
          <h2 className="text-3xl font-bold text-center mb-12">Beneficios</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Aprendizaje en cualquier momento",
                description: "Aprende mientras te desplazas, haces ejercicio o realizas tareas rutinarias.",
                icon: "🎧"
              },
              {
                title: "Contenido conciso",
                description: "Información relevante y enfocada sin relleno innecesario.",
                icon: "📊"
              },
              {
                title: "Expertos en cada tema",
                description: "Contenido creado por profesionales reconocidos en sus campos.",
                icon: "👨‍🏫"
              },
              {
                title: "Flexibilidad",
                description: "Aprende a tu propio ritmo, cuando tengas tiempo disponible.",
                icon: "⏱️"
              }
            ].map((benefit, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Cómo Funciona */}
      <section className="py-16 bg-white">
        <div className="miyo-container">
          <h2 className="text-3xl font-bold text-center mb-12">Cómo Funciona</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Regístrate",
                description: "Crea tu cuenta en menos de un minuto."
              },
              {
                step: "2",
                title: "Elige tus temas",
                description: "Selecciona los temas que te interesan."
              },
              {
                step: "3",
                title: "Aprende diariamente",
                description: "Dedica 5-10 minutos al día para crecer profesionalmente."
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 rounded-full bg-miyo-800 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 bg-gray-50 border-t border-gray-200">
        <div className="miyo-container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-2xl font-bold text-miyo-800">MIYO</span>
            </div>
            <div className="flex space-x-6 mb-4 md:mb-0">
              <a href="#" className="text-gray-600 hover:text-miyo-800">Términos</a>
              <a href="#" className="text-gray-600 hover:text-miyo-800">Privacidad</a>
            </div>
            <div className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Miyo. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        defaultView={authView}
      />
    </div>
  );
};

export default Landing;
