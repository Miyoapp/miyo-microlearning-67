
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
    <section className="pt-28 pb-16 md:pt-36 md:pb-24 bg-gradient-to-br from-white via-gray-50 to-miyo-50/30">
      <div className="miyo-container">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-slide-down">
              Información en <span className="text-miyo-800">audio</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl animate-slide-up">
              Convierte información en micropodcasts de aprendizaje para capacitar clientes y equipos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-miyo-800 hover:bg-miyo-900 text-white font-medium"
                onClick={scrollToContact}
              >
                Demo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-miyo-800 text-miyo-800 hover:bg-miyo-50"
                onClick={() => setShowLoginDialog(true)}
              >
                Login <LogIn className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </section>
  );
};

export default HeroSection;
