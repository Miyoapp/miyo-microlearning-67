
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LoginDialog } from "@/components/auth/LoginDialog";

const HeroSection = () => {
  const navigate = useNavigate();
  const [showLoginDialog, setShowLoginDialog] = React.useState(false);
  
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-gray-50">
      <div className="miyo-container">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block py-1 px-8 rounded-full bg-miyo-100 text-miyo-800 text-sm font-medium mb-4 animate-fade-in">
            Capacitación eficiente para tu organización
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-slide-down">
            Microaprendizaje en <span className="text-miyo-800">audio</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 animate-slide-up">
            Convierte información en micropodcasts de aprendizaje para capacitar clientes y equipos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-miyo-800 hover:bg-miyo-700 text-white font-medium w-32 py-6 h-auto"
              onClick={scrollToContact}
            >
              Demo <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-miyo-800 text-miyo-800 hover:bg-miyo-50 w-32 py-6 h-auto"
              onClick={() => setShowLoginDialog(true)}
            >
              Login <LogIn className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </section>
  );
};

export default HeroSection;
