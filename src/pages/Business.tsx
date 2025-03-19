
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import { ArrowRight, CheckCircle, BriefcaseBusiness, Users, Target, TrendingUp, BadgeCheck } from "lucide-react";

const Business = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 bg-gradient-to-br from-white via-gray-50 to-miyo-50/30">
        <div className="miyo-container">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center mb-12">
              <span className="inline-block py-1 px-4 rounded-full bg-miyo-100 text-miyo-800 text-sm font-medium mb-4 animate-fade-in">
                Soluciones para empresas
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-slide-down">
                Potencia el desarrollo de <span className="text-miyo-800">tu equipo</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl animate-slide-up">
                Transforma la capacitación de tu equipo con contenido educativo de alta calidad.
                Mejora las habilidades de tus colaboradores con nuestra plataforma de microaprendizaje.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-miyo-800 hover:bg-miyo-900 text-white font-medium">
                  Solicitar demo <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" className="border-miyo-200 text-miyo-800 hover:bg-miyo-100/50">
                  Ver planes empresariales
                </Button>
              </div>
            </div>
            
            <div className="relative mt-16 mb-4 p-6 max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-miyo-100/80 to-miyo-200/60 rounded-2xl blur-3xl opacity-70 -z-10"></div>
              <div className="glass rounded-2xl overflow-hidden p-1">
                <img 
                  src="https://lovable.dev/projects/ee45312b-936a-450e-8d0c-12e0d4e4391d/platform-dashboard.png" 
                  alt="MIYO Platform Dashboard" 
                  className="w-full h-auto rounded-xl shadow-lg animate-scale-in"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="miyo-container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ventajas para tu empresa
            </h2>
            <p className="text-xl text-gray-600">
              Transforma la capacitación de tu equipo con nuestra plataforma de microaprendizaje
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <BenefitCard 
              icon={<BriefcaseBusiness className="h-10 w-10 text-miyo-700" />} 
              title="Formación eficiente"
              description="Nuestras lecciones cortas permiten aprender sin interrumpir el flujo de trabajo."
            />
            <BenefitCard 
              icon={<Users className="h-10 w-10 text-miyo-700" />} 
              title="Desarrollo personalizado"
              description="Contenido adaptado a las necesidades específicas de cada rol en tu empresa."
            />
            <BenefitCard 
              icon={<Target className="h-10 w-10 text-miyo-700" />} 
              title="Resultados medibles"
              description="Analíticas detalladas para seguir el progreso y el impacto en tu organización."
            />
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="miyo-container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Características principales
            </h2>
            <p className="text-xl text-gray-600">
              Una plataforma diseñada para maximizar el aprendizaje y el desarrollo profesional
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6 text-miyo-600" />}
              title="Dashboard analítico"
              description="Visualiza el progreso de tus equipos y el impacto de la capacitación en tiempo real."
            />
            <FeatureCard
              icon={<BadgeCheck className="h-6 w-6 text-miyo-600" />}
              title="Contenido certificado"
              description="Material creado por expertos del sector y validado por profesionales de la educación."
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6 text-miyo-600" />}
              title="Microaprendizaje adaptativo"
              description="Lecciones cortas que se ajustan al ritmo de aprendizaje de cada miembro del equipo."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6 text-miyo-600" />}
              title="Equipos multilingües"
              description="Soporte para múltiples idiomas para empresas con presencia internacional."
            />
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="miyo-container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-xl text-gray-600">
              Descubre cómo MIYO ha transformado el desarrollo profesional en estas empresas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              quote="MIYO ha revolucionado nuestra estrategia de capacitación. Los equipos aprenden más rápido y con mayor retención."
              author="María Rodríguez"
              role="Directora de RRHH"
              company="TechVision"
            />
            <TestimonialCard
              quote="La flexibilidad de aprendizaje y la calidad del contenido han sido clave para mejorar las habilidades de nuestro equipo."
              author="Carlos Méndez"
              role="CEO"
              company="Innovatech"
            />
            <TestimonialCard
              quote="El formato de microaprendizaje se adapta perfectamente a nuestro ritmo de trabajo. Ha sido una inversión excelente."
              author="Laura García"
              role="Team Lead"
              company="Global Solutions"
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-miyo-700 to-miyo-900 text-white">
        <div className="miyo-container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Transforma el desarrollo profesional de tu equipo
            </h2>
            <p className="text-xl mb-8 text-miyo-100">
              Solicita una demostración personalizada para tu empresa y descubre todo el potencial de MIYO.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-white text-miyo-900 hover:bg-miyo-100">
                Solicitar demo
              </Button>
              <Button variant="outline" size="lg" className="border-miyo-300 text-white hover:bg-miyo-800">
                Contactar con ventas
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-100 py-12">
        <div className="miyo-container">
          <div className="text-center">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} MIYO for Business. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Component for benefit cards in the Benefits section
const BenefitCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden bg-white">
      <CardContent className="p-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 p-3 bg-miyo-100 rounded-full">
            {icon}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Component for feature cards in the Features section
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  return (
    <Card className="border border-gray-200 hover:border-miyo-300 shadow-sm hover:shadow-md transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-miyo-100 rounded-lg">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-gray-600">{description}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center text-miyo-700 text-sm font-medium">
          <span>Saber más</span>
          <ArrowRight className="ml-1 h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
};

// Component for testimonial cards in the Testimonials section
const TestimonialCard = ({ quote, author, role, company }: { quote: string, author: string, role: string, company: string }) => {
  return (
    <Card className="border-none bg-gray-50 shadow-sm hover:shadow-md transition-all duration-300">
      <CardContent className="p-6">
        <div className="mb-4 text-miyo-800">
          <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>
        <p className="text-gray-700 mb-6">{quote}</p>
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{author}</span>
          <span className="text-sm text-gray-600">{role}, {company}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default Business;
