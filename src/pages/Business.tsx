
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import { 
  ArrowRight, 
  CheckCircle, 
  FileText, 
  Zap, 
  BarChart3, 
  Clock, 
  TrendingUp, 
  SlidersHorizontal, 
  PenLine,
  ListChecks,
  LayoutDashboard,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

const Business = () => {
  // State for the contact form
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Here we would typically send the data to a server
    // For now, just reset the form
    setFormData({
      name: "",
      company: "",
      email: "",
      message: ""
    });
    // Show success message (would integrate with toast in a real app)
    alert("Solicitud enviada correctamente. Nos pondremos en contacto contigo pronto.");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 bg-gradient-to-br from-white via-gray-50 to-miyo-50/30">
        <div className="miyo-container">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center mb-12">
              <span className="inline-block py-1 px-4 rounded-full bg-miyo-100 text-miyo-800 text-sm font-medium mb-4 animate-fade-in">
                Innovación en Capacitación
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-slide-down">
                Transforma tu documentación en <span className="text-miyo-800">micropodcasts</span> de aprendizaje
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl animate-slide-up">
                Plataforma de microaprendizaje que convierte información en contenido audible para capacitar clientes y partners comerciales de forma efectiva.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-miyo-800 hover:bg-miyo-900 text-white font-medium">
                  Solicitar demo <ArrowRight className="ml-2 h-4 w-4" />
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

            {/* Trusted by Section */}
            <div className="mt-16 text-center">
              <p className="text-gray-500 text-lg mb-8">CONFÍAN EN MIYO</p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                {/* Company logos would go here - using gray placeholders for now */}
                {[1, 2, 3, 4, 5].map((_, index) => (
                  <div key={index} className="w-28 h-12 bg-gray-200/50 rounded-md flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                    <span className="text-gray-400 font-medium">LOGO {index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="miyo-container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Transformamos su documentación e información en micropodcasts
            </h2>
            <p className="text-xl text-gray-600">
              Nuestra tecnología permite clonar voces personalizadas. Distribuimos el contenido en rutas de aprendizaje efectivas.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard 
              icon={<FileText className="h-10 w-10 text-miyo-700" />} 
              title="Documentación a micropodcasts"
              description="Convertimos su documentación en contenido de audio de alta calidad utilizando IA avanzada."
              step="Paso 1"
            />
            <StepCard 
              icon={<PenLine className="h-10 w-10 text-miyo-700" />} 
              title="Microcursos disponibles"
              description="Creamos rutas de aprendizaje personalizadas con contenido organizado y accesible."
              step="Paso 2"
            />
            <StepCard 
              icon={<LayoutDashboard className="h-10 w-10 text-miyo-700" />} 
              title="Dashboard completo"
              description="Accede a análisis detallados y monitorea el progreso de todos los participantes."
              step="Paso 3"
            />
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="miyo-container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por qué elegir Miyo para tu capacitación
            </h2>
            <p className="text-xl text-gray-600">
              Transformamos la capacitación empresarial con una experiencia de aprendizaje única y efectiva.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <BenefitCard 
              icon={<Zap className="h-6 w-6 text-miyo-600" />}
              title="Aprendizaje acelerado"
              description="Formato de audio que facilita la absorción de información y mejora la retención de conocimientos."
            />
            <BenefitCard
              icon={<SlidersHorizontal className="h-6 w-6 text-miyo-600" />}
              title="Contenido inteligente"
              description="Información adaptada a las necesidades específicas de cada empresa y usuario."
            />
            <BenefitCard
              icon={<BarChart3 className="h-6 w-6 text-miyo-600" />}
              title="Analítica detallada"
              description="Seguimiento en tiempo real del progreso y comprensión de los usuarios."
            />
            <BenefitCard
              icon={<ListChecks className="h-6 w-6 text-miyo-600" />}
              title="Experiencia atractiva"
              description="Formato de microaprendizaje que mantiene el interés y reduce la fatiga de aprendizaje."
            />
            <BenefitCard
              icon={<Clock className="h-6 w-6 text-miyo-600" />}
              title="Ahorro de tiempo"
              description="Reduce el tiempo de creación de materiales de capacitación y acelera el proceso de aprendizaje."
            />
            <BenefitCard
              icon={<TrendingUp className="h-6 w-6 text-miyo-600" />}
              title="Escalabilidad"
              description="Solución que crece con tu empresa, adaptándose a nuevas necesidades y volúmenes de usuarios."
            />
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="miyo-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
              ¿Listo para transformar tu capacitación?
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-12">
              <div className="lg:col-span-3">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        placeholder="Tu nombre" 
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Empresa</Label>
                      <Input 
                        id="company" 
                        name="company" 
                        placeholder="Nombre de tu empresa" 
                        value={formData.company}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="tu@email.com" 
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje</Label>
                    <Textarea 
                      id="message" 
                      name="message" 
                      placeholder="¿En qué podemos ayudarte?" 
                      rows={5}
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full md:w-auto bg-miyo-800 hover:bg-miyo-900">
                    Enviar solicitud
                  </Button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-miyo-100 p-3 rounded-full">
                    <Mail className="h-5 w-5 text-miyo-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">info@miyo.com</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-miyo-100 p-3 rounded-full">
                    <Phone className="h-5 w-5 text-miyo-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Teléfono</h3>
                    <p className="text-gray-600">+34 91 123 4567</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-miyo-100 p-3 rounded-full">
                    <MapPin className="h-5 w-5 text-miyo-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Dirección</h3>
                    <p className="text-gray-600">Calle Innovación, 42<br />28001 Madrid, España</p>
                  </div>
                </div>
              </div>
            </div>
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
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <div className="mb-4">
                  <span className="text-2xl font-bold tracking-tight text-miyo-800">MIYO</span>
                </div>
                <p className="text-gray-600 mb-6 max-w-md">
                  Transformamos la capacitación corporativa con microaprendizaje en formato podcast. 
                  Utilizamos IA para convertir documentación en experiencias de audio educativas.
                </p>
                <div className="flex space-x-4">
                  {/* Social media icons */}
                  <a href="#" className="text-gray-500 hover:text-miyo-700 transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-500 hover:text-miyo-700 transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-500 hover:text-miyo-700 transition-colors">
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
                    <li><a href="#" className="text-gray-600 hover:text-miyo-700 transition-colors">Privacidad</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-miyo-700 transition-colors">Términos</a></li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-10 pt-8 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">© {new Date().getFullYear()} MIYO for Business. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Component for step cards in the How It Works section
const StepCard = ({ icon, title, description, step }: { icon: React.ReactNode, title: string, description: string, step: string }) => {
  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden bg-white">
      <CardContent className="p-8">
        <div className="flex flex-col items-center text-center">
          <span className="text-xs font-semibold text-miyo-700 bg-miyo-50 px-3 py-1 rounded-full mb-4">
            {step}
          </span>
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

// Component for benefit cards in the Benefits section
const BenefitCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
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
      </CardContent>
    </Card>
  );
};

export default Business;
