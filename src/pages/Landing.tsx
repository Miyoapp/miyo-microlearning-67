
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '@/components/landing/HeroSection';
import AboutSection from '@/components/landing/AboutSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import Footer from '@/components/landing/Footer';
import AuthModal from '@/components/auth/AuthModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const Landing = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        setIsAuthenticated(true);
        navigate('/');
      }
      
      setIsLoading(false);
    };
    
    checkSession();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
        navigate('/');
        toast({
          title: "¡Inicio de sesión exitoso!",
          description: "Bienvenido a Miyo"
        });
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const handleLoginClick = () => {
    setAuthType('login');
    setAuthModalOpen(true);
  };
  
  const handleRegisterClick = () => {
    setAuthType('register');
    setAuthModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setAuthModalOpen(false);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-miyo-800"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="min-h-screen bg-white">
      <HeroSection onLoginClick={handleLoginClick} onRegisterClick={handleRegisterClick} />
      <AboutSection />
      <BenefitsSection />
      <HowItWorksSection />
      <Footer />
      
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={handleCloseModal} 
        initialView={authType}
      />
    </div>
  );
};

export default Landing;
